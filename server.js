/**
 * server.js
 *
 * WhatsApp Web Bot using List messages:
 *  - Shows a QR code in the terminal for login.
 *  - Alerts the admin number on startup ("Bot is live").
 *  - Immediately replies to any user message with a 5-item list:
 *    [View Listings, Buy Property, Sell Property, Contact Admin, FAQs/Help]
 *  - Handles the user's selection from the list.
 *  - If user selects "Contact Admin," sends the admin a notification about which user wants help.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, List } = require('whatsapp-web.js');

// Hardcode your admin’s phone number here (no plus sign, just digits).
// Example: "254701339573" for +254 701 339573
const ADMIN_NUMBER = '254701339573';

// Create the client with local file-based auth so you don’t have to re-scan every time
const client = new Client({
  authStrategy: new LocalAuth()
});

// Show the QR code in terminal when generated
client.on('qr', (qr) => {
  console.log('Scan this QR code with WhatsApp (Linked Devices):');
  qrcode.generate(qr, { small: true });
});

// When client is ready, log and alert admin
client.on('ready', async () => {
  console.log('WhatsApp client is ready!');
  try {
    await client.sendMessage(ADMIN_NUMBER, "FY’S PROPERTY Bot is LIVE! Please test by sending a message.");
    console.log(`Sent startup alert to admin (${ADMIN_NUMBER}).`);
  } catch (err) {
    console.error('Error sending admin alert:', err);
  }
});

/**
 * Whenever ANY user sends ANY text message, we:
 *  - If it's a "list response," handle their selection.
 *  - Otherwise, immediately send them the 5-item list.
 */
client.on('message', async (msg) => {
  console.log(`Incoming from ${msg.from}: ${msg.body}`);

  // If the message is a "list response," we handle it differently
  if (msg.type === 'list_response') {
    // The user selected an item from the list
    const selectedRowId = msg.selectedRowId;
    console.log(`User selected: ${selectedRowId}`);

    switch (selectedRowId) {
      case 'view_listings':
        await msg.reply(
          "Here are our listings:\n" +
          "1. Cozy Apartment - $250,000\n" +
          "2. Modern Villa - $750,000\n" +
          "3. Luxury Condo - $500,000\n\n" +
          "Reply with the property number if you'd like more details."
        );
        break;

      case 'buy_property':
        await msg.reply(
          "You chose to buy a property. Please reply with the property number or name, and we'll guide you further."
        );
        break;

      case 'sell_property':
        await msg.reply(
          "To sell your property, please send us the details (address, price, photos). Our team will review and contact you soon."
        );
        break;

      case 'contact_admin':
        await msg.reply("Your request to contact the admin has been received. We'll connect you shortly.");
        // Notify the admin
        try {
          await client.sendMessage(
            ADMIN_NUMBER,
            `User ${msg.from} wants to contact you regarding FY’S PROPERTY. Please reach out to them.`
          );
          console.log("Notified admin about contact request.");
        } catch (error) {
          console.error("Error notifying admin:", error);
        }
        break;

      case 'faqs_help':
        await msg.reply(
          "FAQs:\n" +
          "1. How to view listings? Reply with 'menu' to see the list.\n" +
          "2. How to buy? Select 'Buy Property' from the list.\n" +
          "3. How to sell? Select 'Sell Property' from the list.\n" +
          "For more help, reply 'menu' again."
        );
        break;

      default:
        await msg.reply("Unknown option. Please type 'menu' if you'd like to see the list again.");
        break;
    }
    return;
  }

  // Otherwise, the user typed normal text (not a list selection).
  // Immediately show them a 5-item list.
  await sendListMenu(msg.from);
});

/**
 * sendListMenu: Sends a "List" message with 5 items to the user.
 * This is how we can exceed the 3-button limit.
 */
async function sendListMenu(recipient) {
  // Each "section" can have multiple "rows"
  const sections = [
    {
      title: 'Main Menu',
      rows: [
        { id: 'view_listings', title: 'View Listings' },
        { id: 'buy_property', title: 'Buy Property' },
        { id: 'sell_property', title: 'Sell Property' },
        { id: 'contact_admin', title: 'Contact Admin' },
        { id: 'faqs_help', title: 'FAQs/Help' }
      ]
    }
  ];

  // Create the List message
  const list = new List(
    "Welcome to FY’S PROPERTY.\nPlease select an option below:",
    "Show Options",  // the button text
    sections,
    "FY’S PROPERTY Bot", // header
    "Choose from the menu:" // footer
  );

  try {
    await client.sendMessage(recipient, list);
    console.log(`Sent list menu to ${recipient}`);
  } catch (error) {
    console.error(`Error sending list menu to ${recipient}:`, error);
  }
}

// Initialize the client
client.initialize();
