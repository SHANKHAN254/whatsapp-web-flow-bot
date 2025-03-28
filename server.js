/**
 * server.js
 * WhatsApp Web Bot with a QR code login and button-based menu flow.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Initialize the WhatsApp client with local file-based auth
const client = new Client({
  authStrategy: new LocalAuth() // Saves session so you don't need to scan QR code every time
});

// When the QR code is generated, print it to the terminal
client.on('qr', (qr) => {
  console.log('Scan this QR code with your phone to log into WhatsApp:');
  qrcode.generate(qr, { small: true });
});

// When the client is ready, log a message
client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

// Main message listener
client.on('message', async (msg) => {
  // Convert user message to lowercase for easier comparison
  const userMessage = msg.body.toLowerCase().trim();

  // 1. If user types "menu", show them an interactive button menu
  if (userMessage === 'menu') {
    // We can only send up to 3 quick-reply buttons with the "templateButtons" property
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
          displayText: 'Buy a Property',
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
      text: "Welcome to FY'S PROPERTY. Choose an option:",
      footer: 'FY’S PROPERTY Bot',
      templateButtons: templateButtons
    };

    await client.sendMessage(msg.from, buttonMessage);
  }

  // 2. Handle button replies
  else if (msg.type === 'buttons_response') {
    const buttonId = msg.selectedButtonId;
    switch (buttonId) {
      case 'option1':
        await msg.reply(
          "Here are our listings:\n1. Cozy Apartment - $250,000\n2. Modern Villa - $750,000\n3. Luxury Condo - $500,000\n\nReply with the property number for more details."
        );
        break;

      case 'option2':
        await msg.reply(
          "To buy a property, please reply with the property number or name, and we'll guide you further."
        );
        break;

      case 'option3':
        await msg.reply(
          'To sell your property, please send us the details (address, price, and photos). Our team will review and contact you.'
        );
        break;

      default:
        await msg.reply('Unknown option selected.');
        break;
    }
  }

  // 3. Handle any other text messages
  else {
    await msg.reply(
      "I'm FY'S PROPERTY Bot.\nType *menu* to see the options."
    );
  }
});

// Initialize the client (this starts the QR code generation, etc.)
client.initialize();
