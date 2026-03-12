import type { CommandMiddleware } from 'grammy';
import type { MyContext } from '../bot.js';
import { createDinner } from '../lib/index.js';

export const startDinner: CommandMiddleware<MyContext> = (ctx) => {
  if (!ctx.message?.text) {
    return ctx.reply('請在此輸入指令');
  }

  const args = ctx.message.text.split(' ');
  const people = Number(args[1]);
  const budget = Number(args[2]);

  if (Number.isNaN(people) || Number.isNaN(budget)) {
    return ctx.reply('請輸入人數和預算');
  }

  const dinner = createDinner(people, budget);

  ctx.session.dinner = dinner;

  ctx.reply(`🍽 聚餐建立\n人數:${people}\n預算:${budget}`);
};

export const dinnerInfo: CommandMiddleware<MyContext> = (ctx) => {
  if (!ctx.session.dinner) {
    return ctx.reply('請先建立聚餐');
  }
  const dinner = ctx.session.dinner;
  ctx.reply(`🍽 聚餐資訊\n人數:${dinner.peopleLimit}\n預算:${dinner.budget}`);
};

export const joinDinner: CommandMiddleware<MyContext> = (ctx) => {
  if (!ctx.session.dinner) {
    return ctx.reply('請先建立聚餐');
  }
  const dinner = ctx.session.dinner;

  if (!ctx.from) return;
  const { id: userId, first_name: name } = ctx.from;
  if (dinner.members.has(userId)) {
    return ctx.reply(`🍽 ${name} 已經加入過聚餐`);
  }

  dinner.members.set(userId, {
    name,
    spent: 0,
  });

  const mention = `<a href="tg://user?id=${ctx.from.id}">${name}</a>`;

  ctx.reply(`🍽 ${mention} 已加入聚餐\n人數:${dinner.members.size}`, {
    parse_mode: 'HTML',
  });
};
