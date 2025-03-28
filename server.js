/**
 * server.js
 *
 * WhatsApp Web Bot that:
 *   - Shows a QR code for login.
 *   - Immediately sends an "I'm alive" message to the admin on startup.
 *   - Replies to ANY incoming user message with a 3-button menu:
 *       [View Listings], [Buy Property], [Sell Property].
 *   - Handles button selections to show different flows.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons } = require('whatsapp-web.js');

// 1. SET YOUR ADMIN NUMBER HERE (with country code, no plus sign)
const ADMIN_NUMBER = '254701339573'; // Example: '254701339573'

// 2. Create a client with LocalAuth so you don't have to scan every time.
const client = new Client({
  authStrategy: new LocalAuth()
});

// 3. Show QR code in terminal on startup
client.on('qr', (qr) => {
  console.log('Scan this QR code with WhatsApp (Linked Devices):');
  qrcode.generate(qr, { small: true });
});

// 4. When the client is ready, send admin a confirmation message
client.on('ready', async () => {
  console.log('WhatsApp client is ready!');

  try {
    await client.sendMessage(ADMIN_NUMBER, "FY’S PROPERTY Bot is now LIVE. Please test by sending any message.");
    console.log(`Sent 'Bot is live' message to admin (${ADMIN_NUMBER}).`);
  } catch (err) {
    console.error('Error sending admin alert:', err);
  }
});

/**
 * 5. Main message handler:
 *    - If the message text matches a button label, handle it.
 *    - Otherwise, send the 3-button menu immediately.
 */
client.on('message', async (msg) => {
  console.log(`Incoming from ${msg.from}: ${msg.body}`);

  // If user clicked one of the button labels, handle it:
  const text = msg.body.trim().toLowerCase();

  if (text === 'view listings') {
    await msg.reply("Here are our current listings:\n1. Cozy Apartment - $250,000\n2. Modern Villa - $750,000\n3. Luxury Condo - $500,000");
    return;
  } 
  else if (text === 'buy property') {
    await msg.reply("You chose to buy a property. Please reply with the property number or details.");
    return;
  } 
  else if (text === 'sell property') {
    await msg.reply("You chose to sell a property. Please send the details (address, price, photos).");
    return;
  }

  // Otherwise, user typed something else -> show them the 3-button menu:
  const buttonMenu = new Buttons(
    "Welcome to FY’S PROPERTY.\nPlease choose an option below:",
    [
      { body: 'View Listings' },
      { body: 'Buy Property' },
      { body: 'Sell Property' }
    ],
    'FY’S PROPERTY Bot',
    'Select:'
  );

  try {
    await client.sendMessage(msg.from, buttonMenu);
    console.log(`Sent button menu to ${msg.from}`);
  } catch (error) {
    console.error(`Error sending button menu to ${msg.from}:`, error);
  }
});

// 6. Initialize the client (this triggers the QR code event and the ready event).
client.initialize();
