/**
 * server.js
 * WhatsApp Web Bot that:
 *  - Generates a QR code for login
 *  - Immediately shows a button menu on the user's first message
 *  - Lets the user re-trigger the menu by typing "menu"
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');

// Keep track of which users have already been shown the menu
const shownMenu = new Set();

const client = new Client({
  authStrategy: new LocalAuth() // persists session so you don't have to re-scan the QR every time
});

// Display QR code in terminal for initial login
client.on('qr', (qr) => {
  console.log('Scan this QR code with your phone to log in:');
  qrcode.generate(qr, { small: true });
});

// Once authenticated and ready
client.on('ready', () => {
  console.log('WhatsApp client is ready!');
});

// Listen for incoming messages
client.on('message', async (msg) => {
  const userMessage = msg.body.toLowerCase().trim();
  const userId = msg.from; // e.g. '2547xxxxxx@c.us'

  // If it's the first time we see this user, show them the menu immediately
  if (!shownMenu.has(userId)) {
    shownMenu.add(userId);
    await sendMenu(msg.from);
    return; // Stop here so we don't process the rest
  }

  // If the user explicitly types "menu" again, show the menu
  if (userMessage === 'menu') {
    await sendMenu(msg.from);
    return;
  }

  // If this is a button response, handle it
  if (msg.type === 'buttons_response') {
    handleButtonReply(msg);
    return;
  }

  // Otherwise, fallback for any text that isn't "menu"
  await msg.reply(
    "Thank you for contacting FY'S PROPERTY. Type *menu* at any time to see the options again."
  );
});

/**
 * Sends a 3-button menu to the specified WhatsApp ID.
 * We can only send up to 3 quick-reply buttons in one message.
 */
async function sendMenu(to) {
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
    text: "Hello! Welcome to FY'S PROPERTY.\n\nPlease choose an option below:",
    footer: 'FY’S PROPERTY Bot',
    templateButtons: templateButtons
  };

  await client.sendMessage(to, buttonMessage);
}

/**
 * Handles a user's button choice.
 */
async function handleButtonReply(msg) {
  const buttonId = msg.selectedButtonId;

  switch (buttonId) {
    case 'option1':
      await msg.reply(
        "Here are our current listings:\n1. Cozy Apartment - $250,000\n2. Modern Villa - $750,000\n3. Luxury Condo - $500,000\n\nReply with the property number if you'd like more details."
      );
      break;

    case 'option2':
      await msg.reply(
        "You've chosen to buy a property. Please reply with the property number or name, and we'll guide you further."
      );
      break;

    case 'option3':
      await msg.reply(
        "To sell your property, please send us details (address, price, photos). Our team will review and contact you soon."
      );
      break;

    default:
      await msg.reply("Unknown option. Please type 'menu' to see choices again.");
      break;
  }
}

// Initialize the client
client.initialize();
