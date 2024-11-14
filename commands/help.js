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

    // Load and format each command with styled icons and titles
    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: `✨ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: **${command.name.charAt(0).toUpperCase() + command.name.slice(1)}**`,
        description: command.description,
        payload: `${command.name.toUpperCase()}_PAYLOAD`
      };
    });

    const totalCommands = commandFiles.length;
    const commandsPerPage = 5;
    const totalPages = Math.ceil(totalCommands / commandsPerPage);
    let page = parseInt(args[0], 10);

    if (isNaN(page) || page < 1) {
      page = 1;
    }

    if (args[0] && args[0].toLowerCase() === 'all') {
      const helpTextMessage = `💫 **𝐀𝐥𝐥 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬**\n📜 **𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬:** ${totalCommands}\n\n${commands.map((cmd, index) => `**${index + 1}. ${cmd.title}**\n📖 ${cmd.description}`).join('\n\n')}`;

      return sendMessage(senderId, {
        text: helpTextMessage
      }, pageAccessToken);
    }

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const commandsForPage = commands.slice(startIndex, endIndex);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, {
        text: `🚫 **𝐎𝐨𝐩𝐬! 𝐍𝐨 𝐩𝐚𝐠𝐞 ${page}.**\n🗂️ **𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐏𝐚𝐠𝐞𝐬:** 1 - ${totalPages}`,
      }, pageAccessToken);
    }

    const helpTextMessage = `📖 **𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐎𝐯𝐞𝐫𝐯𝐢𝐞𝐰**\n📄 **𝐏𝐚𝐠𝐞 ${page}/${totalPages}**\n🔢 **𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬:** ${totalCommands}\n\n${commandsForPage.map((cmd, index) => `**${startIndex + index + 1}. ${cmd.title}**\n📝 ${cmd.description}`).join('\n\n')}\n\n🌐 **𝐓𝐢𝐩:** 𝐓𝐲𝐩𝐞 "help [page]" 𝐟𝐨𝐫 𝐦𝐨𝐫𝐞 𝐩𝐚𝐠𝐞𝐬, 𝐨𝐫 "help all" 𝐭𝐨 𝐯𝐢𝐞𝐰 𝐚𝐥𝐥 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬!`;

    // Styled quick replies with page navigation and main menu access
    const quickRepliesPage = [
      ...commandsForPage.map((cmd) => ({
        content_type: "text",
        title: cmd.title.replace('✨ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝: **', '').replace('**', ''), // Clean title for quick replies
        payload: cmd.payload
      })),
      ...(page > 1 ? [{
        content_type: "text",
        title: "⬅️ 𝐏𝐫𝐞𝐯",
        payload: `HELP_${page - 1}`
      }] : []),
      ...(page < totalPages ? [{
        content_type: "text",
        title: "➡️ 𝐍𝐞𝐱𝐭",
        payload: `HELP_${page + 1}`
      }] : []),
      {
        content_type: "text",
        title: "🏠 𝐌𝐚𝐢𝐧 𝐌𝐞𝐧𝐮",
        payload: "MAIN_MENU"
      }
    ];

    // Sending the styled help message with quick reply options
    sendMessage(senderId, {
      text: helpTextMessage,
      quick_replies: quickRepliesPage
    }, pageAccessToken);
  }
};
