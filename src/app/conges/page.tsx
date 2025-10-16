'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { usePlanningStore } from '@/store/usePlanningStore';
import { Conge, TypeConge, StatutConge } from '@/types';
import { CongeCard } from '@/components/conges/CongeCard';
import { CongeModal } from '@/components/conges/CongeModal';

export default function CongesPage() {
  const { conges, loadConges, agents, loadAgents } = usePlanningStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TypeConge | 'all'>('all');
  const [filterStatut, setFilterStatut] = useState<StatutConge | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedConge, setSelectedConge] = useState<Conge | null>(null);

  // Charger les données depuis Firebase
  useEffect(() => {
    loadConges();
    loadAgents();
  }, [loadConges, loadAgents]);

  const filteredConges = conges.filter(conge => {
    const agent = agents.find(a => a.id === conge.agentId);
    const matchesSearch = !searchTerm || 
      (agent && (
        agent.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.prenom.toLowerCase().includes(searchTerm.toLowerCase())
      )) ||
      conge.motif.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || conge.type === filterType;
    const matchesStatut = filterStatut === 'all' || conge.statut === filterStatut;
    
    return matchesSearch && matchesType && matchesStatut;
  });

  const handleNouveauConge = () => {
    setSelectedConge(null);
    setIsModalOpen(true);
  };

  const handleEditConge = (conge: Conge) => {
    setSelectedConge(conge);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedConge(null);
  };

  const getTypeLabel = (type: TypeConge) => {
    const labels = {
      [TypeConge.ANNUEL]: 'Annuel',
      [TypeConge.MALADIE]: 'Maladie',
      [TypeConge.MATERNITE]: 'Maternité',
      [TypeConge.PATERNITE]: 'Paternité',
      [TypeConge.RTT]: 'RTT',
      [TypeConge.AUTRE]: 'Autre',
    };
    return labels[type];
  };

  const getStatutLabel = (statut: StatutConge) => {
    const labels = {
      [StatutConge.EN_ATTENTE]: 'En attente',
      [StatutConge.VALIDE]: 'Validé',
      [StatutConge.REFUSE]: 'Refusé',
    };
    return labels[statut];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Congés</h1>
                <p className="text-gray-600">Gérez les absences et disponibilités</p>
              </div>
            </div>
            
            <Button onClick={handleNouveauConge} className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nouveau congé</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filtres et recherche */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher par agent ou motif..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as TypeConge | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les types</option>
                  <option value={TypeConge.ANNUEL}>Annuel</option>
                  <option value={TypeConge.MALADIE}>Maladie</option>
                  <option value={TypeConge.MATERNITE}>Maternité</option>
                  <option value={TypeConge.PATERNITE}>Paternité</option>
                  <option value={TypeConge.RTT}>RTT</option>
                  <option value={TypeConge.AUTRE}>Autre</option>
                </select>
                
                <select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value as StatutConge | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">Tous les statuts</option>
                  <option value={StatutConge.EN_ATTENTE}>En attente</option>
                  <option value={StatutConge.VALIDE}>Validé</option>
                  <option value={StatutConge.REFUSE}>Refusé</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total congés</p>
                  <p className="text-2xl font-bold text-gray-900">{conges.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {conges.filter(c => c.statut === StatutConge.EN_ATTENTE).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validés</p>
                  <p className="text-2xl font-bold text-green-600">
                    {conges.filter(c => c.statut === StatutConge.VALIDE).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Refusés</p>
                  <p className="text-2xl font-bold text-red-600">
                    {conges.filter(c => c.statut === StatutConge.REFUSE).length}
                  </p>
                </div>
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des congés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredConges.map((conge) => (
            <CongeCard
              key={conge.id}
              conge={conge}
              agent={agents.find(a => a.id === conge.agentId)}
              onEdit={handleEditConge}
            />
          ))}
        </div>

        {filteredConges.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucun congé trouvé
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterType !== 'all' || filterStatut !== 'all'
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'Commencez par ajouter votre premier congé'
                }
              </p>
              {!searchTerm && filterType === 'all' && filterStatut === 'all' && (
                <Button onClick={handleNouveauConge}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un congé
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de congé */}
      <CongeModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        conge={selectedConge}
      />
    </div>
  );
}
