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

    // Load and format each command with styled icons and titles in Mathematical Sans Bold
    const commands = commandFiles.map((file, index) => {
      const command = require(path.join(commandsDir, file));
      return {
        title: `✨ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: **${command.name.charAt(0).toUpperCase() + command.name.slice(1)}**`,
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
      const helpTextMessage = `💫 **𝗔𝗹𝗹 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀**\n📜 **𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:** ${totalCommands}\n\n${commands.map((cmd, index) => `**${index + 1}. ${cmd.title}**\n📖 ${cmd.description}`).join('\n\n')}`;

      return sendMessage(senderId, {
        text: helpTextMessage
      }, pageAccessToken);
    }

    const startIndex = (page - 1) * commandsPerPage;
    const endIndex = startIndex + commandsPerPage;
    const commandsForPage = commands.slice(startIndex, endIndex);

    if (commandsForPage.length === 0) {
      return sendMessage(senderId, {
        text: `🚫 **𝗢𝗼𝗽𝘀! 𝗡𝗼 𝗣𝗮𝗴𝗲 ${page}.**\n🗂️ **𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗣𝗮𝗴𝗲𝘀:** 1 - ${totalPages}`,
      }, pageAccessToken);
    }

    const helpTextMessage = `📖 **𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 𝗢𝘃𝗲𝗿𝘃𝗶𝗲𝘄**\n📄 **𝗣𝗮𝗴𝗲 ${page}/${totalPages}**\n🔢 **𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀:** ${totalCommands}\n\n${commandsForPage.map((cmd, index) => `**${startIndex + index + 1}. ${cmd.title}**\n📝 ${cmd.description}`).join('\n\n')}\n\n🌐 **𝗧𝗶𝗽:** 𝗧𝘆𝗽𝗲 "help [page]" 𝗳𝗼𝗿 𝗺𝗼𝗿𝗲 𝗽𝗮𝗴𝗲𝘀, 𝗼𝗿 "help all" 𝗧𝗼 𝘃𝗶𝗲𝘄 𝗮𝗹𝗹 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀!`;

    // Styled quick replies with page navigation and main menu access
    const quickRepliesPage = [
      ...commandsForPage.map((cmd) => ({
        content_type: "text",
        title: cmd.title.replace('✨ 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: **', '').replace('**', ''), // Clean title for quick replies
        payload: cmd.payload
      })),
      ...(page > 1 ? [{
        content_type: "text",
        title: "⬅️ 𝗣𝗿𝗲𝘃",
        payload: `HELP_${page - 1}`
      }] : []),
      ...(page < totalPages ? [{
        content_type: "text",
        title: "➡️ 𝗡𝗲𝘅𝘁",
        payload: `HELP_${page + 1}`
      }] : []),
      {
        content_type: "text",
        title: "🏠 𝗠𝗮𝗶𝗻 𝗠𝗲𝗻𝘂",
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
