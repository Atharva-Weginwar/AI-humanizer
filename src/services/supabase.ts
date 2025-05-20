import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please connect to Supabase.');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Auth functions
export const signUp = async (email: string, password: string, fullName: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });
  
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  // Clear all storage
  window.localStorage.clear();
  window.sessionStorage.clear();
  
  // Sign out from Supabase
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  
  // Clear any remaining auth state
  await supabase.auth.clearSession();
};

export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data?.user;
};

// Document functions
export const saveDocument = async (userId: string, title: string, originalText: string, humanizedText: string, settings: any, udDocumentId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .insert([
      {
        user_id: userId,
        title,
        original_text: originalText,
        humanized_text: humanizedText,
        character_count: originalText.length,
        ud_document_id: udDocumentId,
        humanization_settings: settings
      }
    ])
    .select();
  
  if (error) throw error;
  return data;
};

export const updateDocument = async (id: string, updates: any) => {
  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  return data;
};

export const getDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getDocument = async (id: string) => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteDocument = async (id: string) => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Credit functions
export const getUserCredits = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('credits_remaining, plan_type')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
};

export const deductCredits = async (userId: string, amount: number, description: string) => {
  // Start a Supabase transaction
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('credits_remaining')
    .eq('id', userId)
    .single();

  if (userError) throw userError;
  if (!user) throw new Error('User not found');
  
  if (user.credits_remaining < amount) {
    throw new Error('Insufficient credits');
  }

  // Update user credits
  const { error: updateError } = await supabase
    .from('users')
    .update({ credits_remaining: user.credits_remaining - amount })
    .eq('id', userId);

  if (updateError) throw updateError;

  // Record the transaction
  const { error: transactionError } = await supabase
    .from('credit_transactions')
    .insert([{
      user_id: userId,
      amount: -amount,
      description,
      transaction_type: 'usage'
    }]);

  if (transactionError) throw transactionError;

  return user.credits_remaining - amount;
};

export const recordCreditTransaction = async (userId: string, amount: number, description: string, transactionType: string) => {
  const { error } = await supabase
    .from('credit_transactions')
    .insert([
      {
        user_id: userId,
        amount,
        description,
        transaction_type: transactionType
      }
    ]);
  
  if (error) throw error;
};

// Plans
export const getPlans = async () => {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('monthly_price', { ascending: true });
  
  if (error) throw error;
  return data;
};