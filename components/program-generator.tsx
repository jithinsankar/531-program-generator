"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, Star } from "lucide-react";

type Lift = "Squat" | "Bench Press" | "Deadlift" | "Overhead Press";
type Unit = "lbs" | "kg";

interface MaxLifts {
  [key: string]: number;
}

interface EnabledLifts {
  [key: string]: boolean;
}

const TRAINING_MAX_PERCENTAGE = 0.9;
const WEEK_PERCENTAGES = [
  [0.65, 0.75, 0.85],
  [0.7, 0.8, 0.9],
  [0.75, 0.85, 0.95],
  [0.4, 0.5, 0.6],
];

const LBS_TO_KG = 0.453592;
const KG_TO_LBS = 2.20462;

const INCREASE_PERCENTAGE = 0.05; // 5% increase after each cycle

export default function ProgramGenerator() {
  const [maxLifts, setMaxLifts] = useState<MaxLifts>({
    Squat: 0,
    "Bench Press": 0,
    Deadlift: 0,
    "Overhead Press": 0,
  });
  const [enabledLifts, setEnabledLifts] = useState<EnabledLifts>({
    Squat: true,
    "Bench Press": true,
    Deadlift: true,
    "Overhead Press": true,
  });
  const [program, setProgram] = useState<string[][]>([]);
  const [unit, setUnit] = useState<Unit>("lbs");
  const programRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("531ProgramData");
    if (savedData) {
      const {
        maxLifts: savedMaxLifts,
        enabledLifts: savedEnabledLifts,
        unit: savedUnit,
      } = JSON.parse(savedData);
      setMaxLifts(savedMaxLifts);
      setEnabledLifts(savedEnabledLifts);
      setUnit(savedUnit);
    }
  }, []);

  const saveToLocalStorage = () => {
    localStorage.setItem(
      "531ProgramData",
      JSON.stringify({ maxLifts, enabledLifts, unit })
    );
  };

  const handleInputChange = (lift: Lift, value: string) => {
    setMaxLifts((prev) => ({ ...prev, [lift]: parseFloat(value) || 0 }));
  };

  const toggleUnit = () => {
    setUnit((prev) => (prev === "lbs" ? "kg" : "lbs"));
    setMaxLifts((prev) => {
      const conversionFactor = unit === "lbs" ? LBS_TO_KG : KG_TO_LBS;
      return Object.fromEntries(
        Object.entries(prev).map(([lift, weight]) => [
          lift,
          Math.round(weight * conversionFactor),
        ])
      );
    });
  };

  const toggleLift = (lift: Lift) => {
    setEnabledLifts((prev) => ({ ...prev, [lift]: !prev[lift] }));
  };

  const calculateTrainingMax = (oneRepMax: number) => {
    return Math.round(oneRepMax * TRAINING_MAX_PERCENTAGE);
  };

  const calculateWeight = (trainingMax: number, percentage: number) => {
    const rawWeight = trainingMax * percentage;
    const roundTo = unit === "lbs" ? 5 : 2.5;
    return Math.round(rawWeight / roundTo) * roundTo;
  };

  const generateProgram = () => {
    const newProgram: string[][] = [];

    Object.entries(maxLifts).forEach(([lift, oneRepMax]) => {
      if (!enabledLifts[lift]) return;

      const trainingMax = calculateTrainingMax(oneRepMax);
      const liftProgram: string[] = [`${lift} (TM: ${trainingMax} ${unit})`];

      WEEK_PERCENTAGES.forEach((weekPercentages, weekIndex) => {
        const weekSets = weekPercentages.map((percentage) => {
          const weight = calculateWeight(trainingMax, percentage);
          const reps = weekIndex === 3 ? "5" : weekIndex === 2 ? "5/3/1" : "5";
          return `${weight} ${unit} x ${reps}`;
        });
        liftProgram.push(`Week ${weekIndex + 1}: ${weekSets.join(", ")}`);
      });

      const nextCycleIncrease =
        Math.round(
          (trainingMax * INCREASE_PERCENTAGE) / (unit === "lbs" ? 5 : 2.5)
        ) * (unit === "lbs" ? 5 : 2.5);
      liftProgram.push(`Next cycle: Increase by ${nextCycleIncrease} ${unit}`);

      newProgram.push(liftProgram);
    });

    setProgram(newProgram);
    saveToLocalStorage();

    // Scroll to the program after a short delay to ensure rendering is complete
    setTimeout(() => {
      programRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <div className="mt-4">
            <h1 className="text-3xl font-extrabold tracking-tight">
              5/3/1 Program Generator
            </h1>
          </div>

          <CardDescription>
            Enter your one-rep max (1RM) for each lift to generate your 4-week
            5/3/1 program.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              generateProgram();
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-end space-x-2">
              <Label htmlFor="unit-toggle">lbs</Label>
              <Switch
                id="unit-toggle"
                checked={unit === "kg"}
                onCheckedChange={toggleUnit}
              />
              <Label htmlFor="unit-toggle">kg</Label>
            </div>
            {Object.keys(maxLifts).map((lift) => (
              <div key={lift} className="flex items-center space-x-2">
                <Checkbox
                  id={`enable-${lift}`}
                  checked={enabledLifts[lift]}
                  onCheckedChange={() => toggleLift(lift as Lift)}
                />
                <div className="flex-grow">
                  <Label htmlFor={lift}>
                    {lift} 1RM ({unit})
                  </Label>
                  <Input
                    id={lift}
                    type="number"
                    value={maxLifts[lift] || ""}
                    onChange={(e) =>
                      handleInputChange(lift as Lift, e.target.value)
                    }
                    placeholder={`Enter weight in ${unit}`}
                    disabled={!enabledLifts[lift]}
                  />
                </div>
              </div>
            ))}
            <Button type="submit" className="w-full">
              Generate Program
            </Button>
          </form>
        </CardContent>
      </Card>

      {program.length > 0 && (
        <div ref={programRef}>
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Your 5/3/1 Program</CardTitle>
              <CardDescription>
                4-week cycle based on your one-rep max lifts (weights in {unit})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lift</TableHead>
                    <TableHead>Week 1</TableHead>
                    <TableHead>Week 2</TableHead>
                    <TableHead>Week 3</TableHead>
                    <TableHead>Week 4 (Deload)</TableHead>
                    <TableHead>Next Cycle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {program.map((liftProgram, index) => (
                    <TableRow key={index}>
                      {liftProgram.map((week, weekIndex) => (
                        <TableCell key={weekIndex}>{week}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Alert className="mt-4">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>
              After completing the 4-week cycle, increase your Training Max (TM)
              as suggested in the &quot;Next Cycle&quot; column for continued
              progress.
            </AlertDescription>
          </Alert>
        </div>
      )}

      <Alert className="mt-4">
        <Star className="h-4 w-4" />
        <h1 className="text-lg font-bold">
          Boost Your Strength with the 5/3/1 Workout Program
        </h1>
        <AlertDescription className="mt-4">
          The <strong>5/3/1 workout program</strong> is one of the most
          effective strength training systems, focusing on core compound lifts
          like the <strong>squat</strong>, <strong>deadlift</strong>,{" "}
          <strong>bench press</strong>, and <strong>overhead press</strong>.
          Designed by Jim Wendler, this program uses calculated percentages of
          your <strong>Training Max (TM)</strong> to ensure progressive overload
          and consistent gains over time.
          <br />
          <br />
          Each 4-week cycle involves incremental increases to your TM, allowing
          you to <strong>build muscle</strong> and{" "}
          <strong>increase strength</strong> while minimizing the risk of
          injury. To keep progressing, adjust your Training Max as recommended
          at the end of each cycle.
          <br />
          <br />
          Whether you&quot;re new to lifting or an advanced athlete, the 5/3/1
          method provides a simple yet effective framework for long-term
          success. Follow the principles, stay consistent, and experience steady
          growth in your strength levels.
        </AlertDescription>
      </Alert>
    </div>
  );
}
