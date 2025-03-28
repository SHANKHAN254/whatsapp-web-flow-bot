/**
 * server.js
 *
 * WhatsApp Web Bot that:
 *  - Displays a QR code on startup (scan with WhatsApp -> Linked Devices).
 *  - Alerts the admin (ADMIN_NUMBER) on startup. Admin number must be "XXXXXXXXXXX@c.us".
 *  - On any incoming user message, sends a 5-item List menu:
 *      [View Listings, Buy Property, Sell Property, Contact Admin, FAQs/Help].
 *  - Handles list responses:
 *      - If user picks "Contact Admin," the admin is notified with the user's ID.
 *      - Other items respond with appropriate text.
 *
 * IMPORTANT:
 *   1. ADMIN_NUMBER must be in the format "XXXXXXXXXXX@c.us".
 *   2. The phone that runs the bot must remain online.
 *   3. If you see "Invalid WID error," double-check your phone numbers.
 */

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, List } = require('whatsapp-web.js');

// 1. Set your admin’s WhatsApp ID in the format "<phone>@c.us" (no plus sign).
//    Example: "254701339573@c.us" for +254 701 339573.
const ADMIN_NUMBER = '254701339573@c.us';

// Create the client, saving session locally so you don’t have to re-scan every time
const client = new Client({
  authStrategy: new LocalAuth()
});

// When QR code is generated, display it in the terminal
client.on('qr', (qr) => {
  console.log('Scan this QR code with your phone (Linked Devices in WhatsApp):');
  qrcode.generate(qr, { small: true });
});

// When the client is ready, send the admin a "Bot is live" message
client.on('ready', async () => {
  console.log('WhatsApp client is ready!');
  try {
    await client.sendMessage(ADMIN_NUMBER, "FY’S PROPERTY Bot is now LIVE. Please test by sending a message.");
    console.log(`Startup alert sent to admin: ${ADMIN_NUMBER}`);
  } catch (error) {
    console.error('Error sending admin alert:', error);
  }
});

/**
 * This event fires whenever ANY user sends ANY text message.
 * We'll:
 *  - If it's a list response, handle that choice.
 *  - Otherwise, send them the 5-item List menu.
 */
client.on('message', async (msg) => {
  console.log(`Incoming message from ${msg.from}: ${msg.body}`);

  // If user responded to a List
  if (msg.type === 'list_response') {
    const selectedRowId = msg.selectedRowId; // The "id" of the chosen row
    console.log(`User selected rowId: ${selectedRowId}`);

    switch (selectedRowId) {
      case 'view_listings':
        await msg.reply(
          "Here are our listings:\n1. Cozy Apartment - $250,000\n2. Modern Villa - $750,000\n3. Luxury Condo - $500,000\n\nReply with the property number if you'd like more details."
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
        try {
          // Notify admin
          await client.sendMessage(
            ADMIN_NUMBER,
            `User ${msg.from} wants to contact you about FY’S PROPERTY. Please reach out to them.`
          );
          console.log(`Notified admin that ${msg.from} wants contact.`);
        } catch (err) {
          console.error('Error notifying admin:', err);
        }
        break;

      case 'faqs_help':
        await msg.reply(
          "FAQs:\n" +
          "1. How to view listings? Send any message to see the list, then pick 'View Listings'.\n" +
          "2. How to buy? Pick 'Buy Property' from the list.\n" +
          "3. How to sell? Pick 'Sell Property' from the list.\n" +
          "4. Contact Admin if you need direct assistance.\n" +
          "Type anything again to see the menu."
        );
        break;

      default:
        await msg.reply("Unknown option. Please send any message again to see the menu.");
        break;
    }
  } else {
    // If it's NOT a list response, show them the 5-item list
    await sendListMenu(msg.from);
  }
});

/**
 * Sends a 5-item List menu to the given recipient. The user can pick 1 of 5 rows.
 */
async function sendListMenu(recipient) {
  // Must be "XXXXXXXXXXX@c.us" for a valid WID
  // The library usually auto-handles user 'from' addresses, but let's ensure admin is correct
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

  const list = new List(
    "Welcome to FY’S PROPERTY.\nSelect an option below:",
    "Show Options", // the button text
    sections,
    "FY’S PROPERTY Bot", // header
    "Choose from the menu." // footer
  );

  try {
    await client.sendMessage(recipient, list);
    console.log(`Sent list menu to ${recipient}`);
  } catch (error) {
    console.error(`Error sending list menu to ${recipient}:`, error);
  }
}

// Finally, initialize the client (this triggers QR code generation, etc.)
client.initialize();
