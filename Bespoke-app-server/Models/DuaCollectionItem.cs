namespace BespokeDuaApi.Models
{
    public class DuaCollectionItem
    {
        public Guid CollectionId { get; set; }
        public Guid DuaId { get; set; }
        public int SortOrder { get; set; }

        public DuaCollection Collection { get; set; } = null!;
        public SavedDua SavedDua { get; set; } = null!;
    }
}
