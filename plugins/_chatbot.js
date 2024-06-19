import fetch from 'node-fetch'
import axios from 'axios'

export async function before(m, { conn }) {
  try {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    const { users, chats } = global.db.data;
    if (!users[m.sender] || !chats[m.chat]) return;

    let name = conn.getName(m.sender);
    if (['protocolMessage', 'pollUpdateMessage', 'reactionMessage', 'stickerMessage'].includes(m.mtype)) {
      return;
    }

    if (!m.msg || !m.message || m.key.remoteJid !== m.chat || users[m.sender].banned || chats[m.chat].isBanned) {
      return;
    }

    if (!m.quoted || !m.quoted.isBaileys) return;
    if (!chats[m.chat].chatbot) return true;

    const encodedMsg = encodeURIComponent(m.text);
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyDJC5a882ruaC4XL6ejY1yhgRkN-JNQKg8',
      {
        contents: [{ parts: [{ text: encodedMsg }] }],
      }
    );

    const { data } = response;
    if (data.candidates && data.candidates.length > 0) {
      let reply = data.candidates[0].content.parts[0].text;
      reply = reply.replace(/Google/gi, 'Kanaa').replace(/a large language model/gi, 'botname');
      m.reply(reply);
    } else {
      m.reply('No suitable response from the API.');
    }
  } catch (error) {
    console.error(error);
    m.reply('Maaf, terjadi kesalahan saat memproses permintaan Anda.');
  }
}
