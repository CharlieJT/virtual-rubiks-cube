import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  keyProp: any;
}

const TypewriterText = ({ text, keyProp }: TypewriterTextProps) => {
  const [displayed, setDisplayed] = useState("");
  // Increase minHeight for all slides (e.g. 10em for more comfort)
  const minHeight = "8.6em";

  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [text, keyProp]);

  return (
    <span
      className="text-sm md:text-md text-gray-700 whitespace-pre-line block"
      style={{ minHeight, display: "block" }}
    >
      {displayed}
    </span>
  );
};

export default TypewriterText;
