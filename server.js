/**
 * server.js
 *
 * This bot uses whatsapp-web.js to:
 *   - Display a QR code for WhatsApp Web login.
 *   - On startup, send the admin (ADMIN_WAID) an interactive test menu.
 *   - When any client sends any message, immediately reply with a button-based menu.
 *   - Process button responses to trigger corresponding flows.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
require('dotenv').config();

// Initialize the client with persistent authentication.
const client = new Client({
  authStrategy: new LocalAuth()
});

// When a QR code is generated, display it in the terminal.
client.on('qr', (qr) => {
  console.log('Scan the following QR code with your phone:');
  qrcode.generate(qr, { small: true });
});

// When the client is ready, log a message and send the admin the test menu.
client.on('ready', async () => {
  console.log('WhatsApp client is ready!');
  await sendAdminMenu();
});

// Function to send an interactive menu to a recipient using buttons.
async function sendMenu(recipient) {
  const menuMessage = {
    body: "Welcome to FY'S PROPERTY. Please choose an option:",
    // WhatsApp Web supports up to 3 buttons in a message.
    buttons: [
      { body: 'View Listings' },
      { body: 'Buy Property' },
      { body: 'Sell Property' }
    ],
    headerType: 1 // optional header type (1 for text header)
  };
  try {
    await client.sendMessage(recipient, menuMessage);
    console.log(`Menu sent to ${recipient}`);
  } catch (error) {
    console.error(`Error sending menu to ${recipient}:`, error);
  }
}

// Function to send a special admin menu on startup.
async function sendAdminMenu() {
  const adminNumber = process.env.ADMIN_WAID || '254701339573';
  const adminMessage = {
    body: "FY'S PROPERTY Bot is LIVE!\nHere is your admin test menu:",
    buttons: [
      { body: 'Test: View Listings' },
      { body: 'Test: Buy Property' },
      { body: 'Test: Sell Property' }
    ],
    headerType: 1
  };
  try {
    await client.sendMessage(adminNumber, adminMessage);
    console.log(`Admin menu sent to ${adminNumber}`);
  } catch (error) {
    console.error(`Error sending admin menu:`, error);
  }
}

// Handler for button responses.
async function handleButtonResponse(msg) {
  const selected = msg.selectedButtonId || msg.body; // sometimes the button text becomes the body
  console.log(`Button response from ${msg.from}: ${selected}`);

  if (selected === 'View Listings' || selected === 'Test: View Listings') {
    await msg.reply("Our listings:\n1. Cozy Apartment - $250,000\n2. Modern Villa - $750,000\n3. Luxury Condo - $500,000");
  } else if (selected === 'Buy Property' || selected === 'Test: Buy Property') {
    await msg.reply("You chose to buy a property. Please reply with the property number or details.");
  } else if (selected === 'Sell Property' || selected === 'Test: Sell Property') {
    await msg.reply("You chose to sell a property. Please send us your property details (address, price, photos).");
  } else {
    await msg.reply("Unknown option. Please try again by sending any message to see the menu.");
  }
}

// Listen for incoming messages.
client.on('message', async (msg) => {
  console.log(`Message from ${msg.from}: ${msg.body}`);

  // If this is a button response, handle it.
  if (msg.type === 'buttons_response') {
    await handleButtonResponse(msg);
    return;
  }

  // For any incoming message, force the menu to be sent.
  await sendMenu(msg.from);
});

// Initialize the client.
client.initialize();
