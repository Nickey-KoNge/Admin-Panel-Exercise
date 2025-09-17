export const formatDatesForDisplay = (
  dates: string | string[] | undefined | null
): string => {
  if (!dates) {
    return "N/A";
  }

  let dateArray: string[];

  if (
    typeof dates === "string" &&
    dates.startsWith("[") &&
    dates.endsWith("]")
  ) {
    try {
      dateArray = JSON.parse(dates);
    } catch (e) {
      return "Invalid Format";
    }
  } else if (Array.isArray(dates)) {
    dateArray = dates;
  } else {
    dateArray = [dates as string];
  }

  if (dateArray.length === 0) {
    return "N/A";
  }

  const formattedParts = dateArray
    .filter(Boolean)
    .sort()
    .map((dateString) => {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        return null;
      }
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);
    })
    .filter(Boolean);

  if (formattedParts.length === 0) {
    return "N/A";
  }

  return formattedParts.join(", ");
};
