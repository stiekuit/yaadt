
export interface CustomerInfo {
  customerName?: string;
  customerNumber?: string;
  customerEmail?: string;
  customerGroup?: string;
  deviceSerials?: string[];
}

export interface ChatMessage {
  sender: 'user' | 'bot';
  message: string;
  created_at: string;
}

export const formatCustomerInfo = (customerInfo: CustomerInfo): string => {
  const fields = [
    { label: 'Customer Name', value: customerInfo.customerName },
    { label: 'Contact Number', value: customerInfo.customerNumber },
    { label: 'Customer Email', value: customerInfo.customerEmail },
    { label: 'Customer Group', value: customerInfo.customerGroup },
  ];

  const customerRows = fields
    .filter(field => field.value)
    .map(field => `<tr><td style="font-weight: bold; padding: 4px 8px 4px 0;">${field.label}:</td><td style="padding: 4px 0;">${escapeHtml(field.value!)}</td></tr>`)
    .join('');

  // Handle device serials separately
  let deviceSerialsRow = '';
  if (customerInfo.deviceSerials && customerInfo.deviceSerials.length > 0) {
    const validSerials = customerInfo.deviceSerials.filter(serial => serial.trim());
    if (validSerials.length > 0) {
      const serialsList = validSerials.map(serial => escapeHtml(serial)).join(', ');
      deviceSerialsRow = `<tr><td style="font-weight: bold; padding: 4px 8px 4px 0;">Device Serial Numbers:</td><td style="padding: 4px 0;">${serialsList}</td></tr>`;
    }
  }

  if (customerRows || deviceSerialsRow) {
    return `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px;">Customer Information</h3>
        <table style="border-collapse: collapse; margin-bottom: 15px;">
          ${customerRows}
          ${deviceSerialsRow}
        </table>
      </div>
    `;
  }

  return '';
};

export const formatChatHistory = (chatMessages: ChatMessage[]): string => {
  if (!chatMessages || chatMessages.length === 0) {
    return '';
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const chatRows = chatMessages
    .map((message, index) => {
      const senderLabel = message.sender === 'user' ? 'Customer' : 'Support Agent';
      const senderColor = message.sender === 'user' ? '#e74c3c' : '#3498db';
      
      return `
        <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid ${senderColor}; background-color: #f8f9fa;">
          <div style="font-weight: bold; color: ${senderColor}; margin-bottom: 5px;">
            ${senderLabel} - ${formatTimestamp(message.created_at)}
          </div>
          <div style="line-height: 1.4;">
            ${escapeHtml(message.message).replace(/\n/g, '<br>')}
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 16px;">Chat History</h3>
      ${chatRows}
    </div>
  `;
};

export const formatTicketDescription = (
  mainDescription: string,
  customerInfo?: CustomerInfo,
  chatMessages?: ChatMessage[]
): string => {
  const customerSection = customerInfo ? formatCustomerInfo(customerInfo) : '';
  const chatSection = chatMessages ? formatChatHistory(chatMessages) : '';
  
  const descriptionSection = mainDescription ? `
    <div style="margin-bottom: 20px;">
      <h3 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px;">Issue Description</h3>
      <div style="line-height: 1.6; padding: 10px; background-color: #ffffff; border: 1px solid #e1e8ed; border-radius: 4px;">
        ${escapeHtml(mainDescription).replace(/\n/g, '<br>')}
      </div>
    </div>
  ` : '';

  return `
    <div style="font-family: Arial, sans-serif; color: #2c3e50;">
      ${customerSection}
      ${chatSection}
      ${descriptionSection}
    </div>
  `.trim();
};

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};
