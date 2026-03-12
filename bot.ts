import { Bot, Context, session, type SessionFlavor } from 'grammy';
import type { Dinner } from './types/index.js';
import { dinnerInfo, joinDinner, startDinner } from './commands/dinner.js';
import { cancelOrder, order, orderShare, summary } from './commands/order.js';

// 機器server上沒有IPv6，所以強制node-fetch只能用IPv4
import https from 'node:https';
import fetch from 'node-fetch';
const agent = new https.Agent({ family: 4 });
// 建立一個完整 fetch wrapper
const fetchWithAgent = ((url, options) => {
  return fetch(url, { ...options, agent });
}) as typeof fetch;

// 把靜態屬性也 copy 過去
Object.assign(fetchWithAgent, fetch);

interface SessionData {
  dinner: Dinner | null;
}

export type MyContext = Context & SessionFlavor<SessionData>;

export const bot = new Bot<MyContext>(process.env.BOT_TOKEN!, {
  client: { fetch: fetchWithAgent },
});

function initial(): SessionData {
  return { dinner: null };
}
bot.use(session({ initial }));

bot.command('start_dinner', startDinner); // 建立聚餐 ex: /start_dinner 人數 個人預算
bot.command('dinner_info', dinnerInfo); // 查看聚餐資訊
bot.command('join_dinner', joinDinner); // 加入聚餐

bot.command('order', order); // 點餐 ex: /order 餐點名稱 金額
bot.command('summary', summary); // 點餐總覽
bot.command('cancel_order', cancelOrder); // 取消餐點 ex: /cancel_order 餐點名稱

// Start the bot.
bot.start();
