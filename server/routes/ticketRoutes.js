router.post("/", authMiddleware, createTicket);
router.get("/", authMiddleware, adminOnly, getQueue);
