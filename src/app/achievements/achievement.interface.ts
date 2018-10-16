import { DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Achievement {
  achievements?: DocumentReference[];
  description: string;
  type: 'rs' | 'tt' | 'sa';
  id: string;
  name: string;
  reference: DocumentReference;
  runescore: number;
  slug: string;
  wiki: string;

  // Own fields
  achievements$: Observable<Achievement[]>;
}

export interface UserAchievement extends Achievement {
  completed: boolean;
}
