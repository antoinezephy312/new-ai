const fs = require('fs');
const path = require('path');
const { sendMessage } = require('../handles/sendMessage');

module.exports = {
  name: 'help',
  description: 'Display available commands with descriptions',
  role: 1,
  author: 'kiana',
  execute(senderId, args, pageAccessToken) {
    const commandsDir = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsDir).filter(file => file.endsWith('.js'));

    // Load and format each command with a unique icon and style
    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: `✨ ${command.name.charAt(0).toUpperCase() + command.name.slice(1)}`, // Capitalized with sparkle emoji
        description: command.description,
        payload: `${command.name.toUpperCase()}_PAYLOAD`
      };
    });

    const totalCommands = commandFiles.length;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    // Default to page 1 if no valid page number is provided
    if (isNaN(page) || page < 1) {
      page = 1;
    }

    // Display all commands if user requests "help all"
    if (args[0] && args[0].toLowerCase() === 'all') {
      const helpTextMessage = `💫 **All Available Commands**\n📜 **Total Commands:** ${totalCommands}\n\n${commands.map((cmd, index) => `**${index + 1}. ${cmd.title}**\n📖 ${cmd.description}`).join('\n\n')}`;

      return sendMessage(senderId, {
        text: helpTextMessage
      }, pageAccessToken);
    }

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const commandsForPage = commands.slice(startIndex, endIndex);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, {
        text: `🚫 **Oops! No page ${page}.**\nAvailable Pages: 1 - ${totalPages}`,
      }, pageAccessToken);
    }

    // Improved help message with icons, better readability, and tips
    const helpTextMessage = `📖 **Commands Overview** (Page ${page}/${totalPages})\n🔢 **Total Commands:** ${totalCommands}\n\n${commandsForPage.map((cmd, index) => `**${startIndex + index + 1}. ${cmd.title}**\n📝 ${cmd.description}`).join('\n\n')}\n\n🌐 **Tip:** Type "help [page]" for other pages, or "help all" to view all commands at once!`;

    // Enhanced quick replies with page navigation and main menu access
    const quickRepliesPage = [
      ...commandsForPage.map((cmd) => ({
        content_type: "text",
        title: cmd.title.replace('✨ ', ''), // Clean title for quick replies
        payload: cmd.payload
      })),
      ...(page > 1 ? [{
        content_type: "text",
        title: "⬅️ Prev",
        payload: `HELP_${page - 1}`
      }] : []),
      ...(page < totalPages ? [{
        content_type: "text",
        title: "➡️ Next",
        payload: `HELP_${page + 1}`
      }] : []),
      {
        content_type: "text",
        title: "🏠 Main Menu",
        payload: "MAIN_MENU"
      }
    ];

    // Sending the formatted help message with navigation options
    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickRepliesPage
    }, pageAccessToken);
  }
};
