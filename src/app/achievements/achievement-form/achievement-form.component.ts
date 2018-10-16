import { Component, ViewChild, ElementRef } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DocumentReference } from '@firebase/firestore-types';
import * as firebase from 'firebase/app';
import { Observable, of } from 'rxjs';
import { map, first, pluck, switchMap, startWith, debounceTime } from 'rxjs/operators';

import { toTitleCase } from '../../util/to-title-case';
import { slugify } from '../../util/slugify';

import { Achievement } from '../achievement.interface';
import { AchievementService } from '../achievement.service';
import { Category } from '../category.interface';

@Component({
  selector: 'achievement-form',
  templateUrl: './achievement-form.component.html',
  styleUrls: ['./achievement-form.component.scss'],
})
export class AchievementFormComponent {
  group: FormGroup;
  categories$: Observable<Category[]>;
  achievements$: Observable<Achievement[]>;

  @ViewChild('wiki') wikiRef: ElementRef;

  filteredAchievements$: Observable<Achievement[]>;
  subAchievements: Achievement[] = [];
  @ViewChild('achievementsInput') achievementsInput: ElementRef<HTMLInputElement>;

  constructor(
    private afs: AngularFirestore,
    achievementService: AchievementService,
    activatedRoute: ActivatedRoute,
    fb: FormBuilder,
  ) {
    this.categories$ = achievementService.categories$.pipe(first());
    this.achievements$ = achievementService.achievements$.pipe(first());

    // Build the form
    activatedRoute.params
      .pipe(
        first(),
        pluck('id'),
        switchMap((id: string) => {
          if (id === 'new') {
            return of({
              id,
            });
          }

          return afs.doc<Achievement>(`achievements/${id}`).get()
            .pipe(
              map(snapshot => ({
                ...snapshot.data(),
                id,
              })),
            );
        })
      )
      .subscribe((achievement: Partial<Achievement>) => {
        this.achievements$
          .pipe(
            first(),
          )
          .subscribe(achievements => {
            achievement.achievements = achievement.achievements || [];
            this.subAchievements = achievement.achievements.map(sa => achievements.find(a => a.reference.isEqual(sa)));
          });

        this.group = fb.group({
          id: [achievement.id],
          slug: [achievement.slug || '', Validators.required],
          name: [achievement.name || '', Validators.required],
          description: [achievement.description || ''],
          runescore: [achievement.runescore || 0, Validators.required],
          wiki: [achievement.wiki || '', Validators.required],
          type: [achievement.type || 'rs', Validators.required],
          category: [null],
          achievement: [null],
          achievements: [null],
        });

        this.filteredAchievements$ = this.group.get('achievements').valueChanges
          .pipe(
            startWith(null),
            debounceTime(250),
            switchMap((name: string | Achievement | null) => {
              if (!name || typeof name === 'object') {
                return this.achievements$;
              }

              const n = name.toLowerCase();
              return this.achievements$
                .pipe(
                  map(achievements => achievements.filter(a => a.name.toLowerCase().includes(n))),
                );
            }),
            map(achievements => achievements.slice(0, 100)),
          );
      });
  }

  submit() {
    const formData = this.group.value;
    console.log(formData);

    const document: any = {
      description: formData.description,
      type: formData.type,
      name: formData.name,
      runescore: formData.runescore,
      slug: formData.slug,
      wiki: formData.wiki,
    };

    if (this.subAchievements.length) {
      document.achievements = this.subAchievements.map(a => a.reference);
    }

    const achievementCollectionRef = this.afs.collection('achievements').ref;
    const achievementRef = formData.id === 'new'
      ? new AngularFirestoreDocument<Achievement>(achievementCollectionRef.doc(), this.afs).ref
      : achievementCollectionRef.doc(formData.id);

    achievementRef
      .set(document)
      .then(() => {
        if (formData.category) {
          const categoryReference: DocumentReference = formData.category.reference;
          categoryReference.update({
            achievements: firebase.firestore.FieldValue.arrayUnion(achievementRef),
          });
        }

        if (formData.achievement) {
          const achievementReference: DocumentReference = formData.achievement.reference;
          achievementReference.update({
            achievements: firebase.firestore.FieldValue.arrayUnion(achievementRef),
          });
        }

        console.log(formData.id, document);

        // this.group.get('wiki').setValue('');
        this.wikiRef.nativeElement.focus();
      })
      .catch(console.error);
  }

  generateName() {
    const formData = this.group.value;
    const wiki: string = formData.wiki;
    let name = wiki.substr(25).replace(/_/g, ' ');
    name = decodeURIComponent(name);
    name = toTitleCase(name);
    this.group.get('name').setValue(name);
    this.generateSlug();
  }

  generateSlug() {
    const formData = this.group.value;
    const name: string = formData.name;
    const slug = slugify(name);
    this.group.get('slug').setValue(slug);
  }

  remove(subAchievement: Achievement): void {
    this.subAchievements = this.subAchievements.filter(a => a === subAchievement);
  }

  selected(event$: MatAutocompleteSelectedEvent): void {
    const achievement: Achievement = event$.option.value;
    this.subAchievements.push(achievement);
    this.achievementsInput.nativeElement.value = '';
    this.group.get('achievements').setValue(null);
  }

  trackById(index: number, achievementOrCategory: Category | Achievement) {
    return achievementOrCategory.id;
  }
}
