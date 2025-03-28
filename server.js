/**
 * server.js
 *
 * WhatsApp Web Bot using whatsapp-web.js that:
 *   1. Displays a QR code in the terminal for login.
 *   2. Immediately sends the admin a "Bot is live" message upon readiness.
 *   3. On any incoming user message, sends a 5-item List menu with:
 *       - View Listings
 *       - Buy Property
 *       - Sell Property
 *       - Contact Admin
 *       - FAQs/Help
 *   4. Handles list selections. If user picks "Contact Admin," it also notifies the admin.
 *
 * IMPORTANT NOTES:
 *   - You MUST keep the phone (that scans the QR) online/connected for the bot to work.
 *   - ADMIN_NUMBER must be "XXXXXXXXXXX@c.us" with no plus sign or spaces.
 *   - If you see "invalid wid error," it means WhatsApp doesn't recognize that phone number.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, List } = require('whatsapp-web.js');

// 1. HARDCODED ADMIN NUMBER in correct format: e.g. "254701339573@c.us"
const ADMIN_NUMBER = '254701339573@c.us';

// 2. Create the client, storing session locally so you don’t re-scan every time.
const client = new Client({
  authStrategy: new LocalAuth()
});

// 3. Show the QR code in the terminal when generated.
client.on('qr', (qr) => {
  console.log('Scan this QR code with WhatsApp (Linked Devices) to log in:');
  qrcode.generate(qr, { small: true });
});

// 4. Once the client is ready, log it and notify the admin.
client.on('ready', async () => {
  console.log('WhatsApp client is ready!');

  try {
    await client.sendMessage(ADMIN_NUMBER, "FY’S PROPERTY Bot is now LIVE. Please test by sending a message.");
    console.log(`Sent startup alert to admin: ${ADMIN_NUMBER}`);
  } catch (error) {
    console.error('Error sending admin alert:', error);
  }
});

/**
 * 5. Main message handler:
 *    - If the message is a "list_response," handle the user’s selection.
 *    - Otherwise, immediately send them the 5-item List menu.
 */
client.on('message', async (msg) => {
  console.log(`Message from ${msg.from}: ${msg.body}`);

  // If user just chose an item from the list:
  if (msg.type === 'list_response') {
    const choice = msg.selectedRowId; // ID of the chosen row
    console.log(`User selected: ${choice}`);

    switch (choice) {
      case 'view_listings':
        await msg.reply(
          "Our listings:\n" +
          "1. Cozy Apartment - $250,000\n" +
          "2. Modern Villa - $750,000\n" +
          "3. Luxury Condo - $500,000\n\n" +
          "Reply with the property number if you'd like more details."
        );
        break;

      case 'buy_property':
        await msg.reply(
          "You chose to buy a property. Please reply with the property number or details."
        );
        break;

      case 'sell_property':
        await msg.reply(
          "To sell your property, please send us the details (address, price, photos)."
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
          console.log(`Notified admin that ${msg.from} wants contact.`);
        } catch (err) {
          console.error('Error notifying admin:', err);
        }
        break;

      case 'faqs_help':
        await msg.reply(
          "FAQs:\n" +
          "1. How to view listings? Just send any message to see the list, then pick 'View Listings'.\n" +
          "2. How to buy? Pick 'Buy Property' from the list.\n" +
          "3. How to sell? Pick 'Sell Property' from the list.\n" +
          "4. Contact Admin if you need direct help.\n" +
          "Send any message again to see this menu."
        );
        break;

      default:
        await msg.reply("Unknown option. Please send any message to see the menu again.");
    }
  } else {
    // If it's NOT a list response, show them the 5-item menu
    await sendListMenu(msg.from);
  }
});

/**
 * sendListMenu: sends a 5-item list to the user.
 * This is how we can offer more than 3 choices (unlike button-based).
 */
async function sendListMenu(recipient) {
  // Create the sections for the list. We can have multiple sections, but here we use just one.
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
  const listMessage = new List(
    "Welcome to FY’S PROPERTY.\nSelect an option below:",
    "Show Options",  // The button text the user taps
    sections,
    "FY’S PROPERTY Bot", // Header
    "Choose from the menu." // Footer
  );

  try {
    await client.sendMessage(recipient, listMessage);
    console.log(`Sent list menu to ${recipient}`);
  } catch (error) {
    console.error(`Error sending list menu to ${recipient}:`, error);
  }
}

// 6. Initialize the client, which triggers the QR code and event listeners.
client.initialize();
