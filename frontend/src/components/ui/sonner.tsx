import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      offset={20}
      gap={12}
      toastOptions={{
        duration: 4000,
        classNames: {
          // Base toast styling with semantic colors
          toast:
            "group toast flex items-center gap-3 w-full min-w-[340px] max-w-[420px] p-4 bg-white/95 backdrop-blur-sm text-gray-900 border rounded-xl shadow-lg ring-1 ring-black/5 transition-all duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-2 dark:bg-gray-900/95 dark:text-gray-100",
          
          // Success toasts - green accent
          success: "border-green-200/60 ring-green-500/10 dark:border-green-800/60",
          
          // Error toasts - red accent  
          error: "border-red-200/60 ring-red-500/10 dark:border-red-800/60",
          
          // Info toasts - blue accent
          info: "border-blue-200/60 ring-blue-500/10 dark:border-blue-800/60",
          
          // Warning toasts - amber accent
          warning: "border-amber-200/60 ring-amber-500/10 dark:border-amber-800/60",
          
          // Default styling
          default: "border-gray-200/60 ring-gray-500/10 dark:border-gray-800/60",
          
          // Icons for semantic types
          icon: "shrink-0 w-5 h-5",
          
          // Description text
          description: "text-sm text-gray-600 leading-relaxed mt-1 dark:text-gray-400",
          
          // Action buttons
          actionButton: "ml-auto shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50",
          cancelButton: "ml-2 shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
          
          // Close button
          closeButton: "absolute top-3 right-3 rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400/50 dark:text-gray-500 dark:hover:text-gray-300",
        },
        style: {
          fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
