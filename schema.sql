-- Create a table for Todos
CREATE TABLE public.todos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium' NOT NULL,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Create policies for access control
-- 1. Users can view their own todos
CREATE POLICY "Users can view their own todos" 
ON public.todos 
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can insert their own todos
CREATE POLICY "Users can insert their own todos" 
ON public.todos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own todos
CREATE POLICY "Users can update their own todos" 
ON public.todos 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Users can delete their own todos
CREATE POLICY "Users can delete their own todos" 
ON public.todos 
FOR DELETE 
USING (auth.uid() = user_id);
