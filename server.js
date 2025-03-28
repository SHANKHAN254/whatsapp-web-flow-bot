/**
 * server.js
 *
 * WhatsApp Web Bot that:
 *  - Shows a QR code for login.
 *  - Alerts the admin on startup.
 *  - Immediately replies to any user message with a button menu, unless the user
 *    clicked one of the buttons, in which case it processes that choice.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');
require('dotenv').config();

// Create the client with local file-based authentication (so you don't have to re-scan every time).
const client = new Client({
  authStrategy: new LocalAuth()
});

// When a QR code is generated, display it in the terminal.
client.on('qr', (qr) => {
  console.log('Scan the following QR code with your phone to log in:');
  qrcode.generate(qr, { small: true });
});

// When the client is ready, log a message and send an admin alert.
client.on('ready', async () => {
  console.log('WhatsApp client is ready!');

  // Alert the admin (number in .env as ADMIN_WAID)
  const adminNumber = process.env.ADMIN_WAID || '254701339573';
  try {
    await client.sendMessage(adminNumber, "FY’S PROPERTY Bot is live. Please test now by sending any message.");
    console.log(`Alert message sent to admin: ${adminNumber}`);
  } catch (error) {
    console.error('Error sending admin message:', error);
  }
});

/**
 * Listen for incoming messages from any user.
 * - If the user typed "View Listings", "Buy Property", or "Sell Property", we handle that choice.
 * - Otherwise, we show them the 3-button menu.
 */
client.on('message', async (msg) => {
  console.log(`Message from ${msg.from}: ${msg.body}`);

  // Check if user clicked one of the button labels:
  if (msg.body === 'View Listings') {
    await msg.reply(
      "Here are our current listings:\n1. Cozy Apartment - $250,000\n2. Modern Villa - $750,000\n3. Luxury Condo - $500,000\n\nReply with the property number if you'd like more details."
    );
  } else if (msg.body === 'Buy Property') {
    await msg.reply(
      "You chose to buy a property. Please reply with the property number or name, and we'll guide you further."
    );
  } else if (msg.body === 'Sell Property') {
    await msg.reply(
      "To sell your property, please send us the details (address, price, photos). Our team will review your submission and contact you soon."
    );
  } else {
    // For any other text, immediately send the menu with 3 buttons.
    const menu = new Buttons(
      "Welcome to FY’S PROPERTY.\nPlease choose an option below:",
      [
        { body: 'View Listings', id: 'option1' },
        { body: 'Buy Property', id: 'option2' },
        { body: 'Sell Property', id: 'option3' }
      ],
      "FY’S PROPERTY Bot",
      "Select an option:"
    );

    try {
      await client.sendMessage(msg.from, menu);
      console.log(`Sent menu to ${msg.from}`);
    } catch (error) {
      console.error(`Error sending menu to ${msg.from}:`, error);
    }
  }
});

// Initialize the client (this triggers QR code generation and event listeners).
client.initialize();
