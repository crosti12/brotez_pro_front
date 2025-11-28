import { Dialog as MuiDialog } from "@mui/material/Dialog";

const Dialog = ({ visible = false, setVisible = () => {}, children, ...props }) => {
  return (
    <MuiDialog open={visible} onClose={() => setVisible(false)} {...props}>
      {children}
    </MuiDialog>
  );
};

export default Dialog;
