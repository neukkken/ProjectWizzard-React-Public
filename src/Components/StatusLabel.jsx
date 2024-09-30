const statusStyles = {
    "No vista": {
      backgroundColor: "#dc3545", // Rojo
      color: "#000"
    },
    "Vista": {
      backgroundColor: "#28a745", // Verde
      color: "#fff"
    }
  };
  
  const StatusLabel = ({ estado }) => {
    const style = statusStyles[estado] || {
      backgroundColor: "#6c757d",
      color: "#fff"
    };
  
    return (
      <span style={{
        padding: "5px 10px",
        borderRadius: "50px",
        fontSize: "12px",
        fontWeight: "bold",
        position: "fixed",
        height: "20px",
        ...style
      }}>
        
      </span>
    );
  };

export default StatusLabel;