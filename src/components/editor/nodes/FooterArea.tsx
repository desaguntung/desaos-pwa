import { useNode } from "@craftjs/core";
import { FooterBSrE } from "@/components/editor/nodes/FooterBSrE";

export const FooterArea = ({ children }: { children?: React.ReactNode }) => {
  const { connectors: { connect } } = useNode();
  
  return (
    <div 
      ref={(ref) => { if (ref) connect(ref); }}
      id="footer-area-portal"
      className="absolute bottom-0 left-0 right-0 min-h-[100px] flex flex-col justify-end items-center"
      style={{
        padding: "20px 40px",
        zIndex: 10
      }}
    >
      {children}
    </div>
  );
};

FooterArea.craft = {
  displayName: "Footer Area",
  props: {},
  rules: {
    // Only allow FooterBSrE to be dropped here
    canMoveIn: (incomingNodes: any[]) => {
      return incomingNodes.every(node => node.data.type === FooterBSrE || node.data.displayName === "Footer BSrE");
    }
  }
};
