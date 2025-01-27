import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

interface Suggestion {
  title: string;
  content: string;
}

export default function SuggestionsList({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">改善提案</h3>
      <Accordion type="single" collapsible>
        {suggestions.map((suggestion, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="hover:bg-gray-50 px-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  {index + 1}
                </div>
                <span className="text-left">{suggestion.title}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-2 text-gray-600">
              {suggestion.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
