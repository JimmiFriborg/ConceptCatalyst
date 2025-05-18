import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Feature, Category } from "@shared/schema";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChartIcon, BarChart2Icon, Download } from "lucide-react";

interface PriorityVisualizationProps {
  features: Feature[];
}

// Define colors for different categories
const categoryColors = {
  "mvp": "#3b82f6", // blue
  "launch": "#22c55e", // green
  "v1.5": "#8b5cf6", // purple
  "v2.0": "#f97316", // orange
  "rejected": "#ef4444" // red
};

// Define readable names for categories
const categoryNames = {
  "mvp": "MVP (Must Have)",
  "launch": "Launch",
  "v1.5": "Version 1.5",
  "v2.0": "Version 2.0",
  "rejected": "Rejected"
};

// Define colors for different perspectives
const perspectiveColors = {
  "technical": "#2563eb", // blue
  "business": "#16a34a", // green
  "ux": "#9333ea", // purple
  "security": "#dc2626" // red
};

export function PriorityVisualization({ features }: PriorityVisualizationProps) {
  const [activeTab, setActiveTab] = useState<string>("distribution");
  const [chartData, setChartData] = useState<any[]>([]);
  const [perspectiveData, setPerspectiveData] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any[]>([]);
  
  // Prepare data for visualizations when features change
  useEffect(() => {
    if (!features || features.length === 0) return;
    
    // Generate data for category distribution bar chart
    const categoryDistribution = {} as Record<Category, number>;
    
    // Initialize all categories to 0
    (Object.keys(categoryNames) as Category[]).forEach(cat => {
      categoryDistribution[cat] = 0;
    });
    
    // Count features in each category
    features.forEach(feature => {
      categoryDistribution[feature.category as Category]++;
    });
    
    // Format data for recharts
    const formattedCategoryData = Object.entries(categoryDistribution).map(([category, count]) => ({
      category,
      name: categoryNames[category as Category],
      count,
      fill: categoryColors[category as Category]
    }));
    
    setChartData(formattedCategoryData);
    
    // Generate data for perspective distribution
    const perspectiveDistribution = {
      technical: { mvp: 0, launch: 0, "v1.5": 0, "v2.0": 0, rejected: 0 },
      business: { mvp: 0, launch: 0, "v1.5": 0, "v2.0": 0, rejected: 0 },
      ux: { mvp: 0, launch: 0, "v1.5": 0, "v2.0": 0, rejected: 0 },
      security: { mvp: 0, launch: 0, "v1.5": 0, "v2.0": 0, rejected: 0 }
    };
    
    // Count features by perspective and category
    features.forEach(feature => {
      perspectiveDistribution[feature.perspective][feature.category as Category]++;
    });
    
    // Format data for stacked bar chart
    const formattedPerspectiveData = Object.entries(perspectiveDistribution).map(([perspective, categories]) => ({
      perspective,
      name: perspective.charAt(0).toUpperCase() + perspective.slice(1),
      ...categories,
    }));
    
    setPerspectiveData(formattedPerspectiveData);
    
    // Generate data for pie chart
    const pieChartData = Object.entries(categoryDistribution).map(([category, count]) => ({
      name: categoryNames[category as Category],
      value: count,
      category
    }));
    
    setPieData(pieChartData);
    
  }, [features]);
  
  // Handle downloading the visualizations as images
  const handleDownload = (chartId: string, fileName: string) => {
    const chartSvg = document.getElementById(chartId);
    if (!chartSvg) return;
    
    // Create a canvas from the SVG
    const svgData = new XMLSerializer().serializeToString(chartSvg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Create an image from the SVG data
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) return;
        
        // Create download link
        const downloadUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
      });
    };
    
    img.src = url;
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Feature Priority Visualization</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleDownload(
              activeTab === "distribution" ? "category-chart" : 
              activeTab === "perspective" ? "perspective-chart" : "pie-chart",
              `feature-${activeTab}-chart.png`
            )}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Chart
          </Button>
        </div>
        <CardDescription>
          Visual representation of feature priorities and distribution
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="distribution" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="distribution">
              <BarChart2Icon className="mr-2 h-4 w-4" />
              Category Distribution
            </TabsTrigger>
            <TabsTrigger value="perspective">
              <BarChart2Icon className="mr-2 h-4 w-4" />
              By Perspective
            </TabsTrigger>
            <TabsTrigger value="pie">
              <PieChartIcon className="mr-2 h-4 w-4" />
              Pie Chart
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="distribution" className="pt-4">
            {features.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No features to visualize
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  id="category-chart"
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis label={{ value: 'Number of Features', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value, name) => [`${value} feature(s)`, 'Count']}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Number of Features" 
                    radius={[4, 4, 0, 0]}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="perspective" className="pt-4">
            {features.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No features to visualize
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  id="perspective-chart"
                  data={perspectiveData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Number of Features', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="mvp" 
                    name={categoryNames.mvp}
                    stackId="a" 
                    fill={categoryColors.mvp}
                    radius={[4, 0, 0, 0]}
                  />
                  <Bar 
                    dataKey="launch" 
                    name={categoryNames.launch} 
                    stackId="a" 
                    fill={categoryColors.launch} 
                  />
                  <Bar 
                    dataKey="v1.5" 
                    name={categoryNames["v1.5"]} 
                    stackId="a" 
                    fill={categoryColors["v1.5"]} 
                  />
                  <Bar 
                    dataKey="v2.0" 
                    name={categoryNames["v2.0"]} 
                    stackId="a" 
                    fill={categoryColors["v2.0"]} 
                  />
                  <Bar 
                    dataKey="rejected" 
                    name={categoryNames.rejected} 
                    stackId="a" 
                    fill={categoryColors.rejected}
                    radius={[0, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
          
          <TabsContent value="pie" className="pt-4">
            {features.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No features to visualize
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart id="pie-chart">
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={categoryColors[entry.category as Category]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} feature(s)`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}