export default function CallNextButton() {
  const callNext = async () => {
    await fetch("http://localhost:5000/api/admin/call-next", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  };

  return <button onClick={callNext}>Call Next Student</button>;
}
