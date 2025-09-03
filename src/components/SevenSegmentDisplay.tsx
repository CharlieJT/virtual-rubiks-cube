import React from "react";

interface SevenSegmentDigitProps {
  digit: string;
  size?: "sm" | "md" | "lg" | "xl";
}

interface SevenSegmentDisplayProps {
  time: string;
  size?: "sm" | "md" | "lg" | "xl";
}

// Define which segments are active for each digit (0-9)
const digitSegments: { [key: string]: boolean[] } = {
  "0": [true, true, true, true, true, true, false], // 0
  "1": [false, true, true, false, false, false, false], // 1
  "2": [true, true, false, true, true, false, true], // 2
  "3": [true, true, true, true, false, false, true], // 3
  "4": [false, true, true, false, false, true, true], // 4
  "5": [true, false, true, true, false, true, true], // 5
  "6": [true, false, true, true, true, true, true], // 6
  "7": [true, true, true, false, false, false, false], // 7
  "8": [true, true, true, true, true, true, true], // 8
  "9": [true, true, true, true, false, true, true], // 9
  ".": [false, false, false, false, false, false, false], // dot (handled separately)
  ":": [false, false, false, false, false, false, false], // colon (handled separately)
  " ": [false, false, false, false, false, false, false], // space
};

const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({
  digit,
  size = "md",
}) => {
  const segments = digitSegments[digit] || [
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ];

  const sizeClasses = {
    sm: { width: "w-3", height: "h-6", thickness: "1.6px" },
    md: { width: "w-5", height: "h-7", thickness: "2.3px" },
    lg: { width: "w-6", height: "h-8", thickness: "2.5px" },
    xl: { width: "w-7", height: "h-10", thickness: "3.5px" },
  };

  const { width, height, thickness } = sizeClasses[size];

  const activeColor = "#00ff00"; // Green
  const inactiveColor = "#001100"; // Very dark green

  return (
    <div className={`relative ${width} ${height} mx-0.2`}>
      {/* Segment A (top) */}
      <div
        className="absolute top-0 left-0.5 right-0.5 h-1"
        style={{
          height: thickness,
          backgroundColor: segments[0] ? activeColor : inactiveColor,
          clipPath:
            "polygon(15% 0%, 85% 0%, 90% 50%, 85% 100%, 15% 100%, 10% 50%)",
        }}
      />

      {/* Segment B (top right) */}
      <div
        className="absolute top-0 right-0.5 w-1"
        style={{
          width: thickness,
          height: "calc(50% + 1.5px)",
          backgroundColor: segments[1] ? activeColor : inactiveColor,
          clipPath:
            "polygon(0% 20%, 50% 12%, 100% 20%, 100% 80%, 50% 88%, 0% 80%)",
        }}
      />

      {/* Segment C (bottom right) */}
      <div
        className="absolute bottom-0 right-0.5 w-1"
        style={{
          width: thickness,
          height: "calc(50% + 1.5px)",
          backgroundColor: segments[2] ? activeColor : inactiveColor,
          clipPath:
            "polygon(0% 20%, 50% 12%, 100% 20%, 100% 80%, 50% 88%, 0% 80%)",
        }}
      />

      {/* Segment D (bottom) */}
      <div
        className="absolute bottom-0 left-0.5 right-0.5 h-1"
        style={{
          height: thickness,
          backgroundColor: segments[3] ? activeColor : inactiveColor,
          clipPath:
            "polygon(15% 0%, 85% 0%, 90% 40%, 85% 100%, 15% 100%, 10% 50%)",
        }}
      />

      {/* Segment E (bottom left) */}
      <div
        className="absolute bottom-0 left-0.5 w-1"
        style={{
          width: thickness,
          height: "calc(50% + 1.5px)",
          backgroundColor: segments[4] ? activeColor : inactiveColor,
          clipPath:
            "polygon(0% 20%, 50% 12%, 100% 20%, 100% 80%, 50% 88%, 0% 80%)",
        }}
      />

      {/* Segment F (top left) */}
      <div
        className="absolute top-0 left-0.5 w-1"
        style={{
          width: thickness,
          height: "calc(50% + 1.5px)",
          backgroundColor: segments[5] ? activeColor : inactiveColor,
          clipPath:
            "polygon(0% 20%, 50% 12%, 100% 20%, 100% 80%, 50% 88%, 0% 80%)",
        }}
      />

      {/* Segment G (middle) */}
      <div
        className="absolute top-1/2 left-0.5 right-0.5 h-1 transform -translate-y-1/2"
        style={{
          height: thickness,
          backgroundColor: segments[6] ? activeColor : inactiveColor,
          clipPath:
            "polygon(15% 0%, 85% 0%, 90% 50%, 85% 100%, 15% 100%, 10% 50%)",
        }}
      />
    </div>
  );
};

const SevenSegmentDisplay: React.FC<SevenSegmentDisplayProps> = ({
  time,
  size = "md",
}) => {
  // Split time into main part and milliseconds part
  const decimalIndex = time.indexOf(".");
  const mainPart = decimalIndex !== -1 ? time.slice(0, decimalIndex) : time;
  const msPart = decimalIndex !== -1 ? time.slice(decimalIndex) : "";
  const isXL = size === "xl";

  const renderCharacter = (char: string, index: number) => {
    if (char === ":") {
      const colonHeight = isXL ? "h-10" : size === "lg" ? "h-8" : "h-8";
      const dotSize = isXL ? "w-1 h-1" : "w-0.5 h-0.5";

      return (
        <div
          key={index}
          className={`flex flex-col justify-center items-center mx-1 ${colonHeight}`}
        >
          <div
            className={`${dotSize} rounded-full mb-0.5`}
            style={{ backgroundColor: "#00ff00" }}
          />
          <div
            className={`${dotSize} rounded-full`}
            style={{ backgroundColor: "#00ff00" }}
          />
        </div>
      );
    }

    if (char === ".") {
      const colonHeight = isXL ? "h-10" : size === "lg" ? "h-8" : "h-8";
      const dotSize = isXL ? "w-1 h-1" : "w-0.5 h-0.5";

      return (
        <div
          key={index}
          className={`flex items-end justify-center ${colonHeight} mx-1`}
        >
          <div
            className={`${dotSize} rounded-full mb-0.5`}
            style={{ backgroundColor: "#00ff00" }}
          />
        </div>
      );
    }

    return <SevenSegmentDigit key={index} digit={char} size={size} />;
  };

  return (
    <div className="flex items-center justify-center bg-black rounded-lg py-2 pl-4 -pr-2 border border-gray-800">
      {/* Main part (MM:SS) */}
      {mainPart.split("").map((char, index) => renderCharacter(char, index))}

      {/* Milliseconds part (.XX) - scaled down */}
      {msPart && (
        <div
          className="flex items-end"
          style={{
            transform: "scale(0.7)",
            transformOrigin: "left bottom",
            marginLeft: "0px",
            marginBottom: isXL ? "1px" : "4.5px",
          }}
        >
          {msPart
            .split("")
            .map((char, index) =>
              renderCharacter(char, mainPart.length + index)
            )}
        </div>
      )}
    </div>
  );
};

export default SevenSegmentDisplay;
