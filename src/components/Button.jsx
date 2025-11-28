const Button = ({ children, ...props }) => {
  return (
    <button style={{ cursor: "pointer", border: "none", background: "none", padding: "none" }} {...props}>
      {children}
    </button>
  );
};

export default Button;
