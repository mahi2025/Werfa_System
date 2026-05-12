export default function CallNextButton() {
  const callNext = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("No admin token found. Please login first.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/admin/call-next", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error("Call next failed:", err);
    }
  };

  return <button onClick={callNext}>Call Next Student</button>;
}
