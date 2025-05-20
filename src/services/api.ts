// API service for Undetectable AI integration

export const submitDocument = async (text: string, settings: any) => {
  try {
    const response = await fetch('https://humanize.undetectable.ai/submit', {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_UNDETECTABLE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: text,
        readability: settings.readability || "High School",
        purpose: settings.purpose || "General Writing",
        strength: settings.strength || "Balanced",
        model: settings.model || "v11"
      })
    });
    
    const data = await response.json();
    
    if (response.status === 400 && data.error === "Insufficient credits") {
      throw new Error("You don't have enough credits to humanize this text.");
    }
    
    if (!response.ok) {
      throw new Error(data.error || "Failed to submit document");
    }
    
    return data; // Contains document ID
  } catch (error) {
    console.error("Submit document error:", error);
    throw error;
  }
};

export const pollDocumentStatus = async (documentId: string) => {
  try {
    const response = await fetch('https://humanize.undetectable.ai/document', {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_UNDETECTABLE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: documentId
      })
    });
    
    if (!response.ok) {
      throw new Error("Failed to retrieve document status");
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Poll document error:", error);
    throw error;
  }
};

export const rehumanizeDocument = async (documentId: string) => {
  try {
    const response = await fetch('https://humanize.undetectable.ai/rehumanize', {
      method: 'POST',
      headers: {
        'apikey': import.meta.env.VITE_UNDETECTABLE_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: documentId
      })
    });
    
    if (!response.ok) {
      throw new Error("Failed to rehumanize document");
    }
    
    const data = await response.json();
    return data; // Contains new document ID
  } catch (error) {
    console.error("Rehumanize document error:", error);
    throw error;
  }
};

export const checkUserCredits = async () => {
  try {
    const response = await fetch('https://humanize.undetectable.ai/check-user-credits', {
      method: 'GET',
      headers: {
        'apikey': import.meta.env.VITE_UNDETECTABLE_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error("Failed to check credits");
    }
    
    const data = await response.json();
    return data; // Contains credit information
  } catch (error) {
    console.error("Check credits error:", error);
    throw error;
  }
};

export const humanizeText = async (text: string, settings: any, userId: string) => {
  try {
    // Calculate required credits (1 credit per character)
    const requiredCredits = text.length;
    
    // Deduct credits before processing
    await deductCredits(userId, requiredCredits, 'Text humanization');
    
    // Submit the document
    const submitResponse = await submitDocument(text, settings);
    const documentId = submitResponse.id;
    
    // Poll for status every 5 seconds
    const maxAttempts = 12; // 1 minute timeout
    let attempts = 0;
    let result;
    
    while (attempts < maxAttempts) {
      attempts++;
      const documentResponse = await pollDocumentStatus(documentId);
      
      // Check if processing is complete
      if (documentResponse.output) {
        result = documentResponse;
        break;
      }
      
      // Wait 5 seconds before polling again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    if (!result) {
      throw new Error("Document processing timed out");
    }
    
    return result;
  } catch (error) {
    // If humanization fails, refund the credits
    if (error.message !== 'Insufficient credits') {
      try {
        await recordCreditTransaction(
          userId,
          text.length,
          'Refund for failed humanization',
          'refund'
        );
      } catch (refundError) {
        console.error('Failed to refund credits:', refundError);
      }
    }
    throw error;
  }
};

export const deductCredits = async (userId: string, amount: number, description: string) => {
  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/rpc/deduct_credits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify({
      p_user_id: userId,
      p_amount: amount,
      p_description: description
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to deduct credits');
  }

  return response.json();
};