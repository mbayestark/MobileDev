import { mutation } from "./_generated/server";

export const backfillUsers = mutation({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let updated = 0;
    for (const user of users) {
      const patches: Record<string, any> = {};
      if ((user as any).isAdmin === undefined) patches.isAdmin = false;
      if ((user as any).isActive === undefined) patches.isActive = true;
      if ((user as any).updatedAt === undefined)
        patches.updatedAt = user.createdAt;
      if ((user as any).password === undefined) patches.password = "changeme";
      if (Object.keys(patches).length > 0) {
        await ctx.db.patch(user._id, patches);
        updated++;
      }
    }
    return { updated };
  },
});
