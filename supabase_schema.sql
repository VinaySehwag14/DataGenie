-- Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'professional', 'business', 'enterprise')),
    ai_queries_used INTEGER DEFAULT 0,
    ai_query_limit INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create data_sources table  
CREATE TABLE IF NOT EXISTS data_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'csv' CHECK (type IN ('csv', 'json', 'google_sheets', 'postgres', 'mysql')),
    row_count INTEGER DEFAULT 0,
    file_url TEXT,
    schema JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create data_rows table (for storing actual data)
CREATE TABLE IF NOT EXISTS data_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data_source_id UUID NOT NULL REFERENCES data_sources(id) ON DELETE CASCADE,
    row_data JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create AI messages table
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    sql_query TEXT,
    result_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_data_sources_workspace_id ON data_sources(workspace_id);
CREATE INDEX IF NOT EXISTS idx_data_rows_data_source_id ON data_rows(data_source_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_workspace_id ON ai_conversations(workspace_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);

-- GIN index for JSONB columns (faster JSON queries)
CREATE INDEX IF NOT EXISTS idx_data_rows_row_data_gin ON data_rows USING GIN(row_data);

-- Enable Row Level Security
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workspaces
CREATE POLICY "Users can view own workspaces"
    ON workspaces FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workspaces"
    ON workspaces FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
    ON workspaces FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
    ON workspaces FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for data_sources
CREATE POLICY "Users can view own data sources"
    ON data_sources FOR SELECT
    USING (workspace_id IN (
        SELECT id FROM workspaces WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create own data sources"
    ON data_sources FOR INSERT
    WITH CHECK (workspace_id IN (
        SELECT id FROM workspaces WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update own data sources"
    ON data_sources FOR UPDATE
    USING (workspace_id IN (
        SELECT id FROM workspaces WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own data sources"
    ON data_sources FOR DELETE
    USING (workspace_id IN (
        SELECT id FROM workspaces WHERE user_id = auth.uid()
    ));

-- RLS Policies for data_rows
CREATE POLICY "Users can view own data rows"
    ON data_rows FOR SELECT
    USING (data_source_id IN (
        SELECT ds.id FROM data_sources ds
        JOIN workspaces w ON ds.workspace_id = w.id
        WHERE w.user_id = auth.uid()
    ));

CREATE POLICY "Users can create own data rows"
    ON data_rows FOR INSERT
    WITH CHECK (data_source_id IN (
        SELECT ds.id FROM data_sources ds
        JOIN workspaces w ON ds.workspace_id = w.id
        WHERE w.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own data rows"
    ON data_rows FOR DELETE
    USING (data_source_id IN (
        SELECT ds.id FROM data_sources ds
        JOIN workspaces w ON ds.workspace_id = w.id
        WHERE w.user_id = auth.uid()
    ));

-- RLS Policies for AI conversations
CREATE POLICY "Users can view own conversations"
    ON ai_conversations FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own conversations"
    ON ai_conversations FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own conversations"
    ON ai_conversations FOR DELETE
    USING (user_id = auth.uid());

-- RLS Policies for AI messages
CREATE POLICY "Users can view own messages"
    ON ai_messages FOR SELECT
    USING (conversation_id IN (
        SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can create own messages"
    ON ai_messages FOR INSERT
    WITH CHECK (conversation_id IN (
        SELECT id FROM ai_conversations WHERE user_id = auth.uid()
    ));

-- Function to automatically create a workspace for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.workspaces (user_id, name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'My Workspace')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create workspace on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_conversations_updated_at BEFORE UPDATE ON ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
