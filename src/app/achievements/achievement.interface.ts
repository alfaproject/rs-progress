import { DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Achievement {
  achievements?: DocumentReference[];
  description: string;
  discord?: string;
  id: string;
  name: string;
  reference: DocumentReference;
  runescore: number;
  slug: string;
  type: 'rs' | 'tt' | 'sa';
  wiki: string;

  // Own fields
  achievements$: Observable<Achievement[]>;
}

export interface UserAchievement extends Achievement {
  completed: boolean;
}
