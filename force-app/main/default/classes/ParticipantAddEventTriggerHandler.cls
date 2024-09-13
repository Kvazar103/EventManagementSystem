public class ParticipantAddEventTriggerHandler {
    
    public static void addParticipantToEventAfterUpdate(List<Participant__c> newParticipants,List<Participant__c> oldParticipants){
        
        Set<Id> newEventsId=new Set<Id>();
        Set<Id> oldEventsId=new Set<Id>();
        
        if(newParticipants!=null){
            for(Participant__c newParticipant: newParticipants){
                newEventsId.add(newParticipant.Event__c);
            }
            for(Participant__c oldParticipant:oldParticipants){
                oldEventsId.add(oldParticipant.Event__c);
            }
        }
        
        List<Event__c> eventsToUpdate=[SELECT Id, Number_of_Participants__c FROM Event__c WHERE Id IN: newEventsId];
        
        List<Event__c> eventsToUpdateTwo=[SELECT Id, Number_of_Participants__c FROM Event__c WHERE Id IN: oldEventsId];

        for(Event__c event:eventsToUpdate){
            Integer participantCount=[SELECT COUNT() FROM Participant__c WHERE Event__c=:event.Id];
            event.Number_of_Participants__c=participantCount;
        }        
        
        for(Event__c event:eventsToUpdateTwo){
            Integer participantCount=[SELECT COUNT() FROM Participant__c WHERE Event__c=:event.Id];
            event.Number_of_Participants__c-=1;
        }
        
        if(!eventsToUpdate.isEmpty()){
            update eventsToUpdate;
        }
        
        if(!eventsToUpdateTwo.isEmpty()){
            update eventsToUpdateTwo;
        }
        
        
    }
    
    public static void addParticipantToEventAfterInsert(List<Participant__c> newParticipant){
        
        Set<Id> eventsToUpdateId=new Set<Id>();
     
        if(newParticipant!=null){
            for(Participant__c participant:newParticipant){
                eventsToUpdateId.add(participant.Event__c);
            }
        }
        List<Event__c> events=[SELECT Id,Number_of_Participants__c FROM Event__c WHERE Id IN:eventsToUpdateId];
        
        for(Event__c event:events){
            event.Number_of_Participants__c+=1;
        }
        
        if(!events.isEmpty()){
            update events;
        }
    }
    public static void deleteParticipantFromEventAfterDeleteHim(List<Participant__c> oldParticipants){
        
        Set<Id> eventsId=new Set<Id>();
        
        if(oldParticipants!=null){
            for(Participant__c participant:oldParticipants){
                eventsId.add(participant.Event__c);
            }
        }
        
        List<Event__c> events=[SELECT Id,Number_of_Participants__c FROM Event__c WHERE Id IN:eventsId];
        
        for(Event__c event:events){
            event.Number_of_Participants__c-=1;
        }
        
        if(!events.isEmpty()){
            update events;
        }
    }
}