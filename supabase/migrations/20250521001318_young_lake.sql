/*
  # Add deduct_credits function
  
  Creates a function to safely deduct credits from a user's balance
  and record the transaction.
*/

CREATE OR REPLACE FUNCTION public.deduct_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits_remaining INTO v_current_credits
  FROM public.users
  WHERE id = p_user_id;

  -- Check if user has enough credits
  IF v_current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;

  -- Update user credits
  UPDATE public.users
  SET credits_remaining = credits_remaining - p_amount
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO public.credit_transactions (
    user_id,
    amount,
    description,
    transaction_type
  ) VALUES (
    p_user_id,
    -p_amount,
    p_description,
    'usage'
  );

  RETURN v_current_credits - p_amount;
END;
$$;