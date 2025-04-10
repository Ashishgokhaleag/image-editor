import { Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { Button } from "../ui/Buttons";

const DesktopToMobileToggle = ({
  isMobileView,
  toggleView,
  isDarkMode,
  toggleTheme,
}) => {
  return (
    <div className="fixed top-4 right-4 flex items-center gap-2">
      <div className="flex items-center rounded-full border bg-backgraund shadow-sm ">
        <Button
          variant="ghost"
          size="icon"
          className="dark:text-gray-400 dark:hover:text-white"
          aria-label="Toggle Desktop View"
          onClick={() => toggleView(false)}
        >
          <Monitor
            className={`h-5 w-5 ${!isMobileView ? "text-primary" : ""} `}
          />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="dark:text-gray-400 dark:hover:text-white"
          aria-label="Toggle Mobile View"
          onClick={() => toggleView(true)}
        >
          <Smartphone
            className={`h-5 w-5 ${!isMobileView ? "text-primary" : ""} `}
          />
        </Button>
      </div>

      <div className="flex items-center rounded-full border  bg-backgraund shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          className="dark:text-gray-400 dark:hover:text-white"
          aria-labell="Toggle Dark View"
          onClick={() => toggleTheme(true)}
        >
          <Moon className={`h-5 w-5 ${!isDarkMode ? "text-primary" : ""} `} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="dark:text-gray-400 dark:hover:text-white"
          aria-label="Toggle Light View"
          onClick={() => toggleTheme(false)}
        >
          <Sun className={`h-5 w-5 ${!isDarkMode ? "text-primary" : ""} `} />
        </Button>
      </div>
    </div>
  );
};

export default DesktopToMobileToggle;
