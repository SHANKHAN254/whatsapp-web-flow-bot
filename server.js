/**
 * server.js
 *
 * This bot uses whatsapp-web.js to:
 *   - Generate a QR code on startup for login.
 *   - Immediately send an interactive button menu when any client sends any message.
 *   - If the sender is the admin (process.env.ADMIN_WAID), send a special admin menu.
 *   - Process button responses accordingly.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Create a new client with persistent session (LocalAuth stores session files)
const client = new Client({
  authStrategy: new LocalAuth()
});

// Print QR code to console when generated
client.on('qr', (qr) => {
  console.log('Scan the following QR code with your phone to log in:');
  qrcode.generate(qr, { small: true });
});

// Once the client is ready, log a message
client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

// Function to send the interactive menu (for regular users)
async function sendMenu(recipient) {
  // WhatsApp currently supports up to 3 quick reply buttons
  const templateButtons = [
    {
      index: 1,
      quickReplyButton: {
        displayText: 'View Listings',
        id: 'option1'
      }
    },
    {
      index: 2,
      quickReplyButton: {
        displayText: 'Buy Property',
        id: 'option2'
      }
    },
    {
      index: 3,
      quickReplyButton: {
        displayText: 'Sell Property',
        id: 'option3'
      }
    }
  ];

  const buttonMessage = {
    text: "Welcome to FY'S PROPERTY.\n\nPlease choose an option:",
    footer: 'FY’S PROPERTY Bot',
    templateButtons: templateButtons
  };

  await client.sendMessage(recipient, buttonMessage);
  console.log(`Sent menu to ${recipient}`);
}

// Function to send a special interactive menu for admin testing
async function sendAdminMenu(recipient) {
  // For admin, we can reuse the same buttons or adjust the text as needed.
  const templateButtons = [
    {
      index: 1,
      quickReplyButton: {
        displayText: 'Test: View Listings',
        id: 'admin_option1'
      }
    },
    {
      index: 2,
      quickReplyButton: {
        displayText: 'Test: Buy Property',
        id: 'admin_option2'
      }
    },
    {
      index: 3,
      quickReplyButton: {
        displayText: 'Test: Sell Property',
        id: 'admin_option3'
      }
    }
  ];

  const buttonMessage = {
    text: "ADMIN: FY'S PROPERTY Bot is live.\n\nPlease choose a test option:",
    footer: 'FY’S PROPERTY Admin Menu',
    templateButtons: templateButtons
  };

  await client.sendMessage(recipient, buttonMessage);
  console.log(`Sent admin menu to ${recipient}`);
}

// Function to handle button responses
async function handleButtonReply(msg) {
  const buttonId = msg.selectedButtonId;
  console.log(`Button response from ${msg.from}: ${buttonId}`);

  if (buttonId === 'option1' || buttonId === 'admin_option1') {
    await msg.reply("Our current listings:\n1. Cozy Apartment - $250,000\n2. Modern Villa - $750,000\n3. Luxury Condo - $500,000\n\nReply with the property number for more details.");
  } else if (buttonId === 'option2' || buttonId === 'admin_option2') {
    await msg.reply("You've chosen to buy a property. Please reply with the property number or name, and we'll guide you further.");
  } else if (buttonId === 'option3' || buttonId === 'admin_option3') {
    await msg.reply("To sell your property, please send us the details (address, price, photos). Our team will review your submission and contact you.");
  } else {
    await msg.reply("Unknown option. Please type 'menu' if you need to see the options again.");
  }
}

// Main event: any incoming message
client.on('message', async (msg) => {
  // If the message is a button response, process it accordingly.
  if (msg.type === 'buttons_response') {
    await handleButtonReply(msg);
    return;
  }

  // For any other message, immediately send the interactive menu.
  // If the sender is the admin, send the admin menu.
  if (msg.from === process.env.ADMIN_WAID) {
    await sendAdminMenu(msg.from);
  } else {
    await sendMenu(msg.from);
  }
});

// Initialize the client
client.initialize();
