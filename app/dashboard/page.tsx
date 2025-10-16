import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, BarChart3, GitBranch, FileText, Bell } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Link href="/dashboard">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                  <CardTitle>Dashboard</CardTitle>
                  <CardDescription>
                    Vue d'ensemble et métriques
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Voir le dashboard</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/planning">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Calendar className="h-12 w-12 mx-auto text-green-600 mb-4" />
                  <CardTitle>Planning</CardTitle>
                  <CardDescription>
                    Visualisez le planning par agents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Accéder au planning</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/timeline">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <GitBranch className="h-12 w-12 mx-auto text-purple-600 mb-4" />
                  <CardTitle>Timeline</CardTitle>
                  <CardDescription>
                    Gestion des projets et jalons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Voir la timeline</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reports">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <FileText className="h-12 w-12 mx-auto text-orange-600 mb-4" />
                  <CardTitle>Rapports</CardTitle>
                  <CardDescription>
                    Générez et exportez vos rapports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Voir les rapports</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/agents">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Users className="h-12 w-12 mx-auto text-indigo-600 mb-4" />
                  <CardTitle>Agents</CardTitle>
                  <CardDescription>
                    Gérez vos équipes et habilitations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Gérer les agents</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/conges">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="text-center">
                  <Bell className="h-12 w-12 mx-auto text-red-600 mb-4" />
                  <CardTitle>Congés</CardTitle>
                  <CardDescription>
                    Suivez les absences et disponibilités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Voir les congés</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}