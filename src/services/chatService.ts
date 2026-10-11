
const decodeEscapedText = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  
  return text
    // Decode escaped newlines
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    // Decode unicode escape sequences
    .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
      return String.fromCharCode(parseInt(code, 16));
    })
    // Handle other common escape sequences
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, '\\');
};

export const parseWebhookResponse = (responseData: string): string => {
  console.log('🔍 parseWebhookResponse - Raw input:', responseData);
  
  if (!responseData || !responseData.trim()) {
    console.log('❌ parseWebhookResponse - Empty or null response data');
    return 'Thank you for your message. Our support team will get back to you shortly.';
  }

  // Try to parse as JSON first
  try {
    console.log('🔄 parseWebhookResponse - Attempting JSON parse');
    const jsonData = JSON.parse(responseData);
    console.log('✅ parseWebhookResponse - JSON parsed successfully:', jsonData);
    
    // Check for nested response structures first
    if (jsonData.response && typeof jsonData.response === 'object') {
      console.log('🔍 parseWebhookResponse - Found nested response object');
      if (jsonData.response.text || jsonData.response.message || jsonData.response.content) {
        const result = jsonData.response.text || jsonData.response.message || jsonData.response.content;
        console.log('✅ parseWebhookResponse - Extracted from response object:', result);
        return decodeEscapedText(result);
      }
    }
    
    // Check for data nested structures
    if (jsonData.data && typeof jsonData.data === 'object') {
      console.log('🔍 parseWebhookResponse - Found nested data object');
      if (jsonData.data.text || jsonData.data.message || jsonData.data.content) {
        const result = jsonData.data.text || jsonData.data.message || jsonData.data.content;
        console.log('✅ parseWebhookResponse - Extracted from data object:', result);
        return decodeEscapedText(result);
      }
    }
    
    // Check for flat structure (common format)
    if (jsonData.text || jsonData.message || jsonData.response || jsonData.content) {
      const result = jsonData.text || jsonData.message || jsonData.response || jsonData.content;
      console.log('✅ parseWebhookResponse - Extracted from flat structure:', result);
      return decodeEscapedText(result);
    } else if (typeof jsonData === 'string') {
      // If the parsed JSON is a string itself
      console.log('✅ parseWebhookResponse - JSON is a string:', jsonData);
      return decodeEscapedText(jsonData);
    } else {
      console.log('🔍 parseWebhookResponse - Searching recursively for string values');
      // Recursively search for any string value in nested objects
      const findFirstString = (obj: any): string | null => {
        if (typeof obj === 'string') return obj;
        if (typeof obj !== 'object' || obj === null) return null;
        
        for (const value of Object.values(obj)) {
          const result = findFirstString(value);
          if (result) return result;
        }
        return null;
      };
      
      const foundString = findFirstString(jsonData);
      if (foundString) {
        console.log('✅ parseWebhookResponse - Found string recursively:', foundString);
        return decodeEscapedText(foundString);
      }
      console.log('❌ parseWebhookResponse - No string found in nested structure');
    }
  } catch (e) {
    console.log('❌ parseWebhookResponse - JSON parse failed, using raw response:', e);
    // If parsing fails, use the raw response as text
    return decodeEscapedText(responseData);
  }

  // Fallback if nothing else works
  console.log('⚠️ parseWebhookResponse - Using fallback response');
  return decodeEscapedText(responseData);
};

export const generateChatTitle = (message: string): string => {
  // Take first 50 characters and ensure it ends with a complete word
  const truncated = message.substring(0, 50);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 20) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + (message.length > 50 ? '...' : '');
};
