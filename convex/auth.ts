export const auth = {
  getUserId: async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    return identity.tokenIdentifier;
  },
};
