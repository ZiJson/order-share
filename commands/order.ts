import type { CommandMiddleware } from 'grammy';
import type { MyContext } from '../bot.js';

export const order: CommandMiddleware<MyContext> = (ctx) => {
  const dinner = ctx.session.dinner;
  if (!dinner) {
    return ctx.reply('請先建立聚餐');
  }
  if (!ctx.from) return;

  if (!ctx.message?.text) {
    return ctx.reply('請在此輸入餐點名稱和金額');
  }

  const args = ctx.message.text.split(' ');
  const dishName = args[1];
  const price = Number(args[2]);

  if (!dishName || !price) {
    return ctx.reply('請輸入餐點名稱和金額');
  }

  const member = dinner.members.get(ctx.from.id);

  if (!member) return ctx.reply('請先 /join_dinner');

  if (member.spent + price > dinner.budget) {
    return ctx.reply('❌ 超過預算');
  }

  member.spent += price;

  dinner.orders.push({
    name: dishName,
    price,
    type: 'personal',
    createdBy: ctx.from.id,
  });

  const mention = `<a href="tg://user?id=${ctx.from.id}">${member.name}</a>`;

  ctx.reply(`${mention} 點了 ${dishName} $${price}`, { parse_mode: 'HTML' });
};

export const orderShare: CommandMiddleware<MyContext> = (ctx) => {
  const dinner = ctx.session.dinner;
  if (!dinner) {
    return ctx.reply('請先建立聚餐');
  }
  if (!ctx.from) return;
  if (!ctx.message?.text) {
    return ctx.reply('請在此輸入餐點名稱和金額');
  }

  const member = dinner.members.get(ctx.from.id);
  if (!member) return ctx.reply('請先 /join_dinner');

  const args = ctx.message.text.split(' ');
  const name = args[1];
  const price = Number(args[2]);

  if (!name || !price) {
    return ctx.reply('請輸入餐點名稱和金額');
  }

  //   const sharePrice = price / dinner.members.size;

  //   for (const member of dinner.members.values()) {
  //     if (member.spent + sharePrice > dinner.budget) {
  //       return ctx.reply(`❌ 有人預算不足`);
  //     }
  //   }

  //   for (const member of dinner.members.values()) {
  //     member.spent += sharePrice;
  //   }

  dinner.orders.push({
    name,
    price,
    type: 'share',
    createdBy: ctx.from.id,
  });

  const mention = `<a href="tg://user?id=${ctx.from.id}">${member.name}</a>`;

  ctx.reply(`${mention} 點了分享餐 ${name} $${price}`, { parse_mode: 'HTML' });
};

export const summary: CommandMiddleware<MyContext> = (ctx) => {
  const dinner = ctx.session.dinner;
  if (!dinner) {
    return ctx.reply('❌ 請先建立聚餐');
  }

  let text = '🍽 <b>聚餐點餐統計</b>\n\n';

  text += `每人預算: ${dinner.budget}\n\n`;

  for (const [id, member] of dinner.members.entries()) {
    const myOrders = dinner.orders.filter((order) => order.createdBy === id);
    const remain = dinner.budget - member.spent;

    // 標題
    text += `👤 <b>${member.name}</b>\n`;

    // 點餐明細
    if (myOrders.length > 0) {
      text += '📋 點餐明細:\n';
      for (const order of myOrders) {
        // 顯示個人餐或分享餐
        text += `      ● ${order.name} - $${order.price}\n`;
      }
    } else {
      text += '📋 點餐明細: 無\n';
    }

    // 預算
    text += `💰 花費: $${member.spent}\n`;
    text += `🪙 剩餘: $${remain}\n`;
    text += '──────────────────\n'; // 分隔線
  }

  ctx.reply(text, { parse_mode: 'HTML' });
};

export const cancelOrder: CommandMiddleware<MyContext> = (ctx) => {
  const dinner = ctx.session.dinner;
  if (!dinner) return ctx.reply('❌ 請先建立聚餐');

  if (!ctx.from) return;

  const args = ctx.message?.text.split(' ');
  const dishName = args?.slice(1).join(' ');
  if (!dishName) return ctx.reply('❌ 請輸入要取消的餐點名稱');

  const userId = ctx.from.id;
  const member = dinner.members.get(ctx.from.id);

  if (!member) return ctx.reply('請先 /join_dinner');

  // 找個人餐或分享餐
  const orderIndex = dinner.orders.findIndex(
    (order) => order.name === dishName && order.createdBy === userId
  );

  if (orderIndex === -1) {
    return ctx.reply('❌ 找不到你點的這道餐點');
  }

  const order = dinner.orders[orderIndex]!;

  // 移除訂單
  dinner.orders.splice(orderIndex, 1);

  // 減掉花費
  if (member) {
    member.spent -= order.price;
  }

  const mention = `<a href="tg://user?id=${ctx.from.id}">${member.name}</a>`;

  ctx.reply(
    `✅ ${mention}已取消 ${dishName}，剩餘預算：$${
      dinner.budget! - member?.spent!
    }`,
    { parse_mode: 'HTML' }
  );
};
