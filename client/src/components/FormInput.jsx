const FormInput = ({ label, className = "", textarea = false, ...props }) => {
  const Input = textarea ? "textarea" : "input";

  return (
    <label className={`space-y-2 ${className}`}>
      <span className="label">{label}</span>
      <Input className={`input ${textarea ? "min-h-24 resize-y" : ""}`} {...props} />
    </label>
  );
};

export default FormInput;

