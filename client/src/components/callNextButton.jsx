const callNext = async () => {
  await fetch("/api/admin/call-next", {
    method: "POST",
  });
};
