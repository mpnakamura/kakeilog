import SetupForm from "@/components/setup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Setup() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>プロフィール設定</CardTitle>
        </CardHeader>
        <CardContent>
          <SetupForm />
        </CardContent>
      </Card>
    </div>
  );
}
