import { X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface TagInputProps {
  placeholder?: string;
  tags: string[];
  setTags: (tags: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function TagInput({
  placeholder = "Add tag...",
  tags,
  setTags,
  className,
  disabled = false,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      e.preventDefault();
      if (!tags.includes(inputValue.trim())) {
        setTags([...tags, inputValue.trim()]);
      }
      setInputValue("");
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      e.preventDefault();
      const newTags = [...tags];
      newTags.pop();
      setTags(newTags);
    }
  };

  const removeTag = (index: number) => {
    const newTags = [...tags];
    newTags.splice(index, 1);
    setTags(newTags);
  };

  return (
    <div
      className={cn(
        "flex flex-wrap gap-2 border rounded-md p-2 bg-background",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {tags.map((tag, index) => (
        <Badge key={index} variant="secondary" className="py-1">
          {tag}
          {!disabled && (
            <button
              type="button"
              className="ml-1 rounded-full outline-none focus:outline-none hover:text-destructive"
              onClick={() => removeTag(index)}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      ))}
      <Input
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        placeholder={placeholder}
        className="border-0 p-0 h-7 min-w-[120px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
        disabled={disabled}
      />
    </div>
  );
}