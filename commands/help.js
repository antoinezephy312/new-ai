const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'help',
  description: 'Show available commands with descriptions',
  role: 1,
  author: 'kiana',

  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Load and format commands
    const commands = commandFiles.map((file) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: `✨ ${command.name.charAt(0).toUpperCase() + command.name.slice(1)}`,
        description: command.description,
        payload: `${command.name.toUpperCase()}_PAYLOAD`
      };
    });

    const totalCommands = commands.length;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    // Default to page 1 if no valid page number
    if (isNaN(page) || page < 1) page = 1;

    // ✅ Handling "help all" (Multi-message)
    if (args[0]?.toLowerCase() === 'all') {
      const helpTextParts = [];
      let tempMessage = `🌟 **All Available Commands**\n📜 **Total Commands**: ${totalCommands}\n\n`;

      commands.forEach((cmd, index) => {
        const commandText = `${index + 1}. ${cmd.title}\n📖 ${cmd.description}\n\n`;
        
        if ((tempMessage + commandText).length > 1900) { // Keeping it under 2000 chars
          helpTextParts.push(tempMessage);
          tempMessage = "";
        }

        tempMessage += commandText;
      });

      if (tempMessage) helpTextParts.push(tempMessage);

      // Send all parts with delay to avoid spam detection
      helpTextParts.forEach((part, idx) => {
        setTimeout(() => sendMessage(senderId, { text: part }, pageAccessToken), idx * 1000);
      });

      return;
    }

    // ✅ Handling Pagination (Default)
    const startIndex = (page - 1) * commandsPerPage;
    const commandsForPage = commands.slice(startIndex, startIndex + commandsPerPage);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, {
        text: `❌ Oops! Page ${page} doesn't exist. There are only ${totalPages} page(s) available.`,
      }, pageAccessToken);
    }

    const helpTextMessage = `🚀 **Commands List** (Page ${page}/${totalPages})\n📜 **Total Commands**: ${totalCommands}\n\n${commandsForPage.map((cmd, index) => `${startIndex + index + 1}. ${cmd.title}\n📝 ${cmd.description}`).join('\n\n')}\n\n📌 **Tip**: Use "help [page]" to switch pages, or "help all" to see all commands!`;

    // ✅ Generate Quick Replies for easier navigation
    const quickReplies = commandsForPage.map((cmd) => ({
      content_type: "text",
      title: cmd.title.replace('✨ ', ''), // Cleaner title for quick replies
      payload: cmd.payload
    }));

    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickReplies
    }, pageAccessToken);
  }
};
