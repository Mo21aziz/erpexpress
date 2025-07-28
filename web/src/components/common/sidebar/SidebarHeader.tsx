import { cn } from "@/lib/utils";
import imageSrc from "@/assets/logo.jpg";
export const SidebarHeader = () => {
  return (
    <div className="flex justify-center p-4">
      <div className={cn(
        "flex items-center justify-center",
        "w-48 h-16", 
        "overflow-hidden"
      )}>
        <img 
          src={imageSrc} 
          alt="Restaurant Logo"
          className="object-contain w-full h-full" // Changed to contain to preserve aspect ratio
          onError={(e) => {
            // Fallback if image fails to load
            console.error("Failed to load logo image", e);
          }}
        />
      </div>
    </div>
  );
};